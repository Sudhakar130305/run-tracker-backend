// Check for existing token on page load
window.onload = () => {
    const token = localStorage.getItem("token");

    if (token) {
        fetchProfile(token);
    }
};

// Fetch user profile after login
async function fetchProfile(token) {
    try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            // Token is valid → redirect to dashboard
            window.location.href = 'dashboard.html';
        } else if (res.status === 401) {
            // Token expired or invalid → clear token and redirect to login
            console.log('Token expired or invalid');
            localStorage.removeItem("token");
            window.location.href = 'login.html';
        } else {
            // Handle other errors
            console.log('Error fetching profile:', res.statusText);
            localStorage.removeItem("token");
        }
    } catch (err) {
        console.error('Error checking token:', err);
        localStorage.removeItem("token");  // Ensure token is cleared on error
        window.location.href = 'login.html';  // Redirect to login page
    }
}

// Login Form Handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    console.log("Token saved:", data.token); // Debugging line
    // Fetch profile after login to validate the token
    await fetchProfile(data.token);
    const token = localStorage.getItem("token");
    console.log("Loaded Token for dashboard:", token);

}

 else {
            document.getElementById("loginMessage").innerText = data.error || "Login failed. Please try again.";
        }
    } catch (err) {
        console.error("Error logging in:", err);
        document.getElementById("loginMessage").innerText = "An error occurred. Please try again.";
    }
});

