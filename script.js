const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyj7XRZdsY1ZapPUbF-l7FeUWicAL8bW3uVA7ivYsFGR00Nqy8TyRPtDHw3dZYHxA72OQ/exec";

let currentDate = new Date();
let selectedDate = null;
let diaryData = [];

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const entriesDiv = document.getElementById("entries");

function loadData() {
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      diaryData = data;
      renderCalendar();
    });
}

function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent =
    currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = day;

    div.onclick = () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
      div.classList.add("selected");
      selectedDate = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      showEntries();
    };

    calendar.appendChild(div);
  }
}

function showEntries() {
  entriesDiv.innerHTML = `<h3>${selectedDate}</h3>`;
  diaryData
    .filter(d => d.date === selectedDate)
    .forEach(d => {
      entriesDiv.innerHTML += `<p><b>${d.title}</b><br>${d.note}</p>`;
    });
}

document.getElementById("addBtn").onclick = () => {
  if (!selectedDate) return alert("Select a date first");

  const title = prompt("Title");
  const note = prompt("Note");

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ date: selectedDate, title, note })
  }).then(() => loadData());
};

loadData();
