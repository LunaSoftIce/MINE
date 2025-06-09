document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // verhindert, dass die Seite neu lädt

  const identifier = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:1337/api/auth/local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      identifier: identifier,
      password: password
    })
  });

  const data = await response.json();
  console.log(data);

  if (response.ok) {
    // Erfolg → JWT speichern, z.B. localStorage:
    localStorage.setItem("jwt", data.jwt);
    alert("login erfolgreich");
    loadUserProfile();
    window.location.href = "adminDashboard.html";
  } else {
    alert("Login fehlgeschlagen: " + (data.error?.message || "Unbekannter Fehler"));
  }
});

function loadUserProfile(){
  const jwt = localStorage.getItem("jwt");

if (jwt) {
  // Jetzt den eingeloggten User mit personalInfo holen:
  fetch("http://localhost:1337/api/users/me?populate[personaldata]=true", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Debug → schauen was zurückkommt

      // personalInfo speichern, falls vorhanden:
      localStorage.setItem("firstname", data.personaldata?.firstname || "");
      localStorage.setItem("lastname", data.personaldata?.lastname || "");

      console.log("Firstname und Lastname gespeichert.");
    })
    .catch(error => {
      console.error("Fehler beim Abrufen von /users/me:", error);
    });
} else {
  console.warn("Kein JWT gefunden → zuerst einloggen!");
}

}