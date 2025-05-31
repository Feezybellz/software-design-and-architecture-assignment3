class CustomHeader extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: "open" });
    this.innerHTML = ` 
        <div class="zcol-md-3 text-end">
            <div id="authButtons">
            <a href="/login"><button type="button" class="btn btn-outline-primary me-2">Login</button></a>
            <a href="/register"><button type="button" class="btn btn-primary">Register</button></a>
            </div>
            <div id="userInfo" style="display: none;">
            <span id="userName" class="me-2"></span>
            <button type="button" class="btn btn-outline-danger" onclick="logout()">Logout</button>
            </div>
        </div>
          `;
  }
  connectedCallback() {
    // console.log("Custom header component added to the page.");

    document.addEventListener("DOMContentLoaded", function () {
      // Check login status on page load
      fetch("/api/auth/login-status")
        .then((response) => response.json())
        .then((data) => {
          const authButtons = document.getElementById("authButtons");
          const userInfo = document.getElementById("userInfo");
          const userName = document.getElementById("userName");

          if (data.isLoggedIn) {
            authButtons.style.display = "none";
            userInfo.style.display = "block";
            userName.textContent = data.user.name;

            // Show appropriate navigation
            const userNav = document.getElementById("userNav");
            const adminNav = document.getElementById("adminNav");

            if (data.user.role === "admin") {
              if (adminNav) adminNav.style.display = "block";
              if (userNav) userNav.style.display = "none";
            } else {
              if (userNav) userNav.style.display = "block";
              if (adminNav) adminNav.style.display = "none";
            }
          } else {
            authButtons.style.display = "block";
            userInfo.style.display = "none";
          }
        })
        .catch((error) => {
          console.error("Error checking login status:", error);
        });
    });
  }
}

window.customElements.define("auth-buttons", CustomHeader);
