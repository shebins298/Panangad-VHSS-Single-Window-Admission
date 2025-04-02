// admincontrolpanel.js

import { auth, db, collection, getDocs, getDoc, updateDoc, deleteDoc, onAuthStateChanged } from "./firebase-config.js";

const dashboardStats = document.getElementById("dashboard-stats");
const userList = document.getElementById("user-list");
const applicationsList = document.getElementById("applications-list");
const activityLogs = document.getElementById("activity-logs");
const logoutButton = document.getElementById("logout-button");

// ✅ Ensure only admin can access
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      alert("Access Denied! Only admins can access this page.");
      window.location.href = "index.html";
      return;
    }

    loadDashboard();
    loadUsers();
    loadApplications();
    loadActivityLogs();
  } else {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
});

// ✅ Load dashboard stats
async function loadDashboard() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const applicationsSnapshot = await getDocs(collection(db, "applications"));

  dashboardStats.innerHTML = `
    <p>Total Users: ${usersSnapshot.size}</p>
    <p>Total Applications: ${applicationsSnapshot.size}</p>
  `;
}

// ✅ Load users into table
async function loadUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  userList.innerHTML = "";

  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    userList.innerHTML += `
      <tr>
        <td>${data.email}</td>
        <td>${data.role || "Pending"}</td>
        <td>
          <select onchange="updateUserRole('${doc.id}', this.value)">
            <option value="pending" ${data.role === "pending" ? "selected" : ""}>Pending</option>
            <option value="normal" ${data.role === "normal" ? "selected" : ""}>User</option>
            <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </td>
        <td><button onclick="deleteUser('${doc.id}')">Delete</button></td>
      </tr>`;
  });
}

// ✅ Update user role
async function updateUserRole(userId, newRole) {
  await updateDoc(doc(db, "users", userId), { role: newRole });
  alert("User role updated!");
}

// ✅ Delete user
async function deleteUser(userId) {
  await deleteDoc(doc(db, "users", userId));
  alert("User deleted!");
  loadUsers();
}

// ✅ Load applications into table
async function loadApplications() {
  const applicationsSnapshot = await getDocs(collection(db, "applications"));
  applicationsList.innerHTML = "";

  applicationsSnapshot.forEach((doc) => {
    const data = doc.data();
    applicationsList.innerHTML += `
      <tr>
        <td>${data.name}</td>
        <td>${data.contact}</td>
        <td>${data.applicationNumber}</td>
        <td>${data.status}</td>
      </tr>`;
  });
}

// ✅ Load activity logs
async function loadActivityLogs() {
  const logsSnapshot = await getDocs(collection(db, "activity_logs"));
  activityLogs.innerHTML = "";

  logsSnapshot.forEach((doc) => {
    const data = doc.data();
    activityLogs.innerHTML += `<p>${data.action} by ${data.email} at ${new Date(data.timestamp.toDate()).toLocaleString()}</p>`;
  });
}

// ✅ Logout function
logoutButton.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});
