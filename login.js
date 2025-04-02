import {
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  doc,
  getDoc,
  setDoc,
  setPersistence,
  browserSessionPersistence,
} from "./firebase-config.js";

const googleLoginButton = document.getElementById("googleLogin");
const loginContainer = document.getElementById("login-container");

// Ensure session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => console.log("Session persistence enabled"))
  .catch((error) => console.error("Persistence Error:", error));

const googleLogin = async () => {
  googleLoginButton.disabled = true;
  loginContainer.style.display = "none";

  try {
    const provider = new GoogleAuthProvider();

    if (window.innerWidth < 768) {
      // 📱 Use Redirect for Mobile
      await signInWithRedirect(auth, provider);
    } else {
      // 💻 Use Popup for Desktop
      const result = await signInWithPopup(auth, provider);
      await handleUserLogin(result.user);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed. Please try again.");
    loginContainer.style.display = "block";
  } finally {
    googleLoginButton.disabled = false;
  }
};

// Handle login after redirect (for mobile users)
getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      handleUserLogin(result.user);
    }
  })
  .catch((error) => console.error("Redirect Login Error:", error));

const handleUserLogin = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, { email: user.email }, { merge: true });
      alert("Login request sent to admin. Please wait for approval.");
      await signOut(auth);
      return;
    }

    const userData = userDoc.data();

    if (!userData.role) {
      alert("Your account is not approved yet. Please contact the admin.");
      await signOut(auth);
      return;
    }

    window.location.href = userData.role === "admin" ? "admin.html" : "user.html";
  } catch (error) {
    console.error("User Handling Error:", error);
    alert("Something went wrong. Try again.");
  }
};

googleLoginButton.addEventListener("click", googleLogin);
