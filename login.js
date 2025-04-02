import {
  auth,
  db,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  doc,
  getDoc,
  setDoc,
  onAuthStateChanged,
} from "./firebase-config.js";

const googleLoginButton = document.getElementById("googleLogin");
const loginContainer = document.getElementById("login-container");

const provider = new GoogleAuthProvider();

// ✅ Handle Login Process
const googleLogin = async () => {
  googleLoginButton.disabled = true; // Prevent multiple clicks
  loginContainer.style.display = "none"; // Hide login container to prevent flicker

  try {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      // ✅ Use Redirect on Mobile
      await signInWithRedirect(auth, provider);
    } else {
      // ✅ Use Popup on Desktop
      const result = await signInWithPopup(auth, provider);
      await handleUserLogin(result.user);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed. Please try again.");
    loginContainer.style.display = "block"; // Show login again
  } finally {
    googleLoginButton.disabled = false; // Re-enable button
  }
};

// ✅ Handle Redirect Login (for mobile users)
const checkRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await handleUserLogin(result.user);
    }
  } catch (error) {
    console.error("Redirect Login Error:", error);
  }
};

// ✅ Handle User Login & Role Checking
const handleUserLogin = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, { email: user.email }, { merge: true });
    alert("Login request sent to admin. Please wait for approval.");
    await signOut(auth);
    loginContainer.style.display = "block"; // Show login again
    return;
  }

  const userData = userDoc.data();
  if (!userData.role) {
    alert("Your account is not approved yet. Please contact the admin.");
    await signOut(auth);
    loginContainer.style.display = "block"; // Show login again
    return;
  }

  // ✅ Redirect to the correct page
  window.location.href = userData.role === "admin" ? "admin.html" : "user.html";
};

// ✅ Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    handleUserLogin(user);
  }
});

googleLoginButton.addEventListener("click", googleLogin);
checkRedirectLogin(); // ✅ Check for mobile redirect login
