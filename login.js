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

const googleLogin = async () => {
  googleLoginButton.disabled = true; // Disable button during login
  loginContainer.style.display = "none"; // Hide login container to prevent flicker

  const provider = new GoogleAuthProvider();

  try {
    if (window.innerWidth <= 768) {
      // 🔥 Mobile: Use redirect
      await signInWithRedirect(auth, provider);
    } else {
      // 🔥 Desktop: Use popup
      const result = await signInWithPopup(auth, provider);
      await handleLogin(result.user);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed. Please try again.");
    loginContainer.style.display = "block"; // Show login again
  } finally {
    googleLoginButton.disabled = false; // Re-enable button
  }
};

// ✅ Handle Login Result (after Redirect)
const handleLogin = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Save new user email
    await setDoc(userRef, { email: user.email }, { merge: true });

    loginContainer.style.display = "block"; // Show login again
    alert("Login request sent to admin. Please wait for approval.");
    await signOut(auth);
    return;
  }

  const userData = userDoc.data();

  if (!userData.role) {
    loginContainer.style.display = "block"; // Show login again
    alert("Your account is not approved yet. Please contact the admin.");
    await signOut(auth);
    return;
  }

  // Redirect user based on role
  window.location.href = userData.role === "admin" ? "admin.html" : "user.html";
};

// ✅ Check Redirect Result
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Handle Redirect Login (if user is coming back)
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        await handleLogin(result.user);
      }
    } catch (error) {
      console.error("Redirect login error:", error);
    }
  }
});

googleLoginButton.addEventListener("click", googleLogin);
