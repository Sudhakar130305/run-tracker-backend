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
                window.location.href = 'login.html';
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
                window.location.href = 'login.html';
                return;
            }
            document.getElementById("runningStats").innerText = stats.error || "Error loading stats";
        }

        // ✅ Show best pace separately
        displayBestPace(token);

    } catch (err) {
        console.error("Error:", err);
        document.getElementById("runningStats").innerText = "An error occurred while fetching data.";
    }
};

// ✅ New function to show personal best pace
async function displayBestPace(token) {
    try {
        const res = await fetch("http://localhost:5000/api/runs", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const runs = await res.json();

        if (res.ok && Array.isArray(runs) && runs.length > 0) {
            let bestRun = runs.reduce((best, run) => {
                let bestPace = best.time / best.distance;
                let currentPace = run.time / run.distance;
                return currentPace < bestPace ? run : best;
            });

            const pace = (bestRun.time / bestRun.distance).toFixed(2);
            const date = new Date(bestRun.date).toLocaleDateString();

            document.getElementById("bestPaceContainer").innerHTML =
                `🏅 <strong>Personal Best Pace:</strong> ${pace} min/km on ${date}`;
        }
    } catch (err) {
        console.error("Error fetching best pace:", err);
    }
}

document.getElementById("runForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = 'login.html';
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
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        if (res.ok) {
            document.getElementById("formMessage").innerText = "Run logged successfully!";
            document.getElementById("runForm").reset();

            // Refresh stats and best pace
            window.onload();
        } else {
            document.getElementById("formMessage").innerText = data.error || "Failed to log run.";
        }
    } catch (err) {
        console.error("Error logging run:", err);
        document.getElementById("formMessage").innerText = "Error submitting run.";
    }
});
