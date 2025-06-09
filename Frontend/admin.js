window.addEventListener("DOMContentLoaded", () => {
  const firstname = localStorage.getItem("firstname");
  const lastname = localStorage.getItem("lastname");
  console.log(firstname + lastname)
  if (firstname || lastname) {
    document.getElementById("usernamePlaceholder").textContent = firstname + " " + lastname;
  } else {
    document.getElementById("usernamePlaceholder").textContent = "Gast";
  }
});

const logoutBtn = document.getElementById("logout")
logoutBtn.addEventListener("click", function(){
  localStorage.removeItem("jwt");
  localStorage.removeItem("username");
  localStorage.removeItem("lastname");
  localStorage.removeItem("firstname");
  window.location.href = "index.html";
})

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt");

  try {
    const response = await fetch("http://localhost:1337/api/companies", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await response.json();
    console.log(data);

    const firmenAnzeigeUl = document.getElementById("firmenanzeige");
    firmenAnzeigeUl.innerHTML = ""; // Ul leeren, falls schon was drin ist

    data.data.forEach(company => {
      const companyName = company.name;

      const li = document.createElement("li");
      li.textContent = companyName;
      li.dataset.id = company.id;

      firmenAnzeigeUl.appendChild(li);
    });

  } catch (error) {
    console.error("Fehler beim Laden der Companies:", error);
  }
});

document.getElementById("firmenanzeige").addEventListener("click", function(event) {
  const clickedElement = event.target;
  
  if (clickedElement.tagName === "LI") {
    const id = clickedElement.dataset.id;
    console.log("Geklickt auf Element mit ID:", id);
    document.querySelectorAll("#firmenanzeige li").forEach(li => {
      li.classList.remove("lihightlight");
    });
    clickedElement.classList.add("lihightlight");
    loadProjectsForCompany(id);
  }
});


async function loadProjectsForCompany(companyId) {
  console.log("Lade Projekte für Firma:", companyId);

  const token = localStorage.getItem("jwt");

  try {
    const response = await fetch(`http://localhost:1337/api/projects?filters[company][id][$eq]=${companyId}&populate=*`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await response.json();
    console.log("Projekte:", data);

    const projekteUl = document.getElementById("projekteanzeige"); // UL für die Projekte
    projekteUl.innerHTML = ""; // alte Projekte entfernen

    data.data.forEach(project => {
      const projectName = project.name; // falls du name als Feld hast

      const li = document.createElement("li");
      li.textContent = projectName;
      li.dataset.id = project.id;
      projekteUl.appendChild(li);
    });

  } catch (error) {
    console.error("Fehler beim Laden der Projekte:", error);
  }
}


document.getElementById("projekteanzeige").addEventListener("click", function(event) {
  const clickedElement = event.target;

  if (clickedElement.tagName === "LI") {
    const projectId = clickedElement.dataset.id;
    console.log("Geklickt auf Projekt mit ID:", projectId);

    // Alle Highlights entfernen
    const allLis = document.querySelectorAll("#projekteanzeige li");
    allLis.forEach(li => li.classList.remove("lihightlight"));

    // Neue Klasse setzen
    clickedElement.classList.add("lihightlight");

    // Benutzer laden
    loadUsersForProject(projectId);
  }
});

async function loadUsersForProject(projectId) {
  const token = localStorage.getItem("jwt");

  try {
    const response = await fetch(
      `http://localhost:1337/api/projects?filters[id][$eq]=${projectId}&populate[employees][populate][personaldata]=true&populate[projectLeaders][populate][personaldata]=true`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await response.json();
    const project = data.data[0]; // Einzelprojekt

    console.log("data", data);
    console.log("data.data", data.data);
    console.log("data.data[0]", data.data?.[0]);

    const userUl = document.getElementById("useranzeige");
    userUl.innerHTML = "";

    const employees = project.employees || [];
    const leaders = project.projectLeaders || [];

    // Projektleiter anzeigen
    leaders.forEach((leader) => {
      const li = document.createElement("li");
      li.textContent = `Projektleiter: ${leader.personaldata.firstname} ${leader.personaldata.lastname}`;
      li.dataset.userid = leader.id;
      userUl.appendChild(li);
    });
    // Mitarbeiter anzeigen
    employees.forEach((emp) => {
      const li = document.createElement("li");
      li.textContent = `Mitarbeiter: ${emp.personaldata.firstname} ${emp.personaldata.lastname}`;
       li.dataset.userid = emp.id; // User ID als data-Attribut speichern!

    
      userUl.appendChild(li);
    });
  } catch (err) {
    console.error("Fehler beim Laden der Benutzer:", err);
  }
}


document.getElementById("useranzeige").addEventListener("click", function(event) {
  const clickedElement = event.target;

  if (clickedElement.tagName === "LI") {
    const userid = clickedElement.dataset.userid;
    console.log("Geklickt auf User mit ID:", userid);

    // Alle Highlights entfernen
    const allLis = document.querySelectorAll("#useranzeige li");
    allLis.forEach(li => li.classList.remove("lihightlight"));

    // Neue Klasse setzen
    clickedElement.classList.add("lihightlight");
  loadUserDetails(userid)
  }
});


async function loadUserDetails(userId) { 
  const token = localStorage.getItem("jwt");

  try {
    const response = await fetch(`http://localhost:1337/api/users/${userId}?populate[personaldata]=true&populate[adress]=true`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await response.json();
    console.log("User Profil:", data);

    // Beispielhafte Anzeige:
    const userDetailsDiv = document.getElementById("detailanzeige");
    userDetailsDiv.innerHTML = `
      <h3>Benutzerprofil</h3>
      <p>Username: ${data.username}</p>
      <p>Email: ${data.email}</p>
      <p>Vorname: ${data.personaldata?.firstname || ""}</p>
      <p>Nachname: ${data.personaldata?.lastname || ""}</p>
      <p>Telefon: ${data.personaldata?.phoneNumber || "-"}</p>
      <p>Adresse: ${data.adress?.[0]?.street || "-"}</p>
      <p>Hausnummer: ${data.adress?.[0]?.housnumber || "-"}</p>
      <p>PLZ: ${data.adress?.[0]?.postalcode || "-"}</p>
      <p>Ort: ${data.adress?.[0]?.city || "-"}</p>
      <p>Kanton: ${data.adress?.[0]?.canton || "-"}</p>
    `;
  } catch (err) {
    console.error("Fehler beim Laden der User-Details:", err);
  }
}