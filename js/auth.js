function checkUserStatus() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const authButtons = document.getElementById("auth-buttons");
  const userInfo = document.getElementById("user-info");
  const welcomeMsg = document.getElementById("welcome-msg");
  const logoutBtn = document.getElementById("logout-btn");
  const loginStatus = document.getElementById("login-status");
  const postsToggleContainer = document.getElementById(
    "posts-toggle-container"
  );
  const postsListSection = document.getElementById("posts-container");
  const myPostsBtn = document.getElementById("my-posts-btn");

  if (token && user) {
 
    if (authButtons) authButtons.style.display = "none";
    if (userInfo) userInfo.style.display = "flex";
    if (welcomeMsg) welcomeMsg.textContent = `Hello, ${user.name}`;
    if (loginStatus) loginStatus.style.display = "none";
    if (myPostsBtn) myPostsBtn.style.display = "inline-block";
    if (postsToggleContainer) postsToggleContainer.style.display = "block";
    if (postsListSection) postsListSection.style.display = "block";

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload(); 
      };
    }
  } else {
    if (authButtons) authButtons.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
    if (welcomeMsg) welcomeMsg.textContent = "";
    if (loginStatus) {
      loginStatus.textContent = "Not logged in";
      loginStatus.style.display = "block";
    }
    if (myPostsBtn) myPostsBtn.style.display = "none";
    if (postsToggleContainer) postsToggleContainer.style.display = "none";
    if (postsListSection) postsListSection.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", checkUserStatus);
