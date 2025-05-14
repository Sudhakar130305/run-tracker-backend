(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in");
      window.location.href = "./login.html";
      return;
    }
  
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    const data = await res.json();
  
    const profileDiv = document.getElementById("profile");
  
    if (res.ok) {
      profileDiv.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>ID:</strong> ${data._id}</p>
      `;
    } else {
      profileDiv.innerHTML = `<p style="color:red;">${data.error || "Failed to load profile."}</p>`;
      localStorage.removeItem("token");
      setTimeout(() => (window.location.href = "./login.html"), 2000);
    }
  })();
  
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  }
  