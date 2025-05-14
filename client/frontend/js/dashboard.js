window.onload = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html"; // Redirect to login page if token doesn't exist
        return;
    }

    try {
        // Fetch user profile info
        const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const profileData = await profileRes.json();

        if (profileRes.ok) {
            document.getElementById("userInfo").innerHTML = `
                <p>Name: ${profileData.name}</p>
                <p>Email: ${profileData.email}</p>
            `;
        } else {
            if (profileData.error === 'Token has expired') {
                alert('Session expired. Please log in again.');
                window.location.href = 'login.html'; // Redirect to login page if token has expired
                return;
            }
            throw new Error(profileData.error || "Failed to load profile");
        }

        // Fetch user running stats
        const statsRes = await fetch("http://localhost:5000/api/stats", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const stats = await statsRes.json();

        if (statsRes.ok) {
            document.getElementById("totalRuns").innerText = stats.totalRuns || 0;
            document.getElementById("totalDistance").innerText = stats.totalDistance?.toFixed(2) || 0;
            document.getElementById("avgPace").innerText = stats.averagePace || 'N/A';
            document.getElementById("bestRun").innerText = stats.bestRun || 'N/A';
        } else {
            if (stats.error === 'Token has expired') {
                alert('Session expired. Please log in again.');
                window.location.href = 'login.html'; // Redirect to login page if token has expired
                return;
            }
            document.getElementById("runningStats").innerText = stats.error || "Error loading stats";
        }

    } catch (err) {
        console.error("Error:", err);
        document.getElementById("runningStats").innerText = "An error occurred while fetching data.";
    }
};

document.getElementById("runForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = 'login.html'; // Redirect to login page if no token is available
        return;
    }

    const distance = parseFloat(document.getElementById("distance").value);
    const time = parseFloat(document.getElementById("time").value);

    try {
        const res = await fetch("http://localhost:5000/api/runs", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ distance, time })
        });

        const data = await res.json();

        if (data.error === 'Token has expired') {
            // Handle the case where the token has expired
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }

        if (res.ok) {
            document.getElementById("formMessage").innerText = "Run logged successfully!";
            document.getElementById("runForm").reset();

            // Refresh stats by reloading the page or fetching stats again
            window.onload();
        } else {
            document.getElementById("formMessage").innerText = data.error || "Failed to log run.";
        }
    } catch (err) {
        console.error("Error logging run:", err);
        document.getElementById("formMessage").innerText = "Error submitting run.";
    }
});
