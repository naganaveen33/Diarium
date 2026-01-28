// IMPORTANT: Replace this URL with your Google Apps Script web app URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_xHIuLTVjcp05xJuUCDvmXgqPvXc5TYmQhRldeao8qXUvADc3aX-tsR6--JdK9iHK5w/exec";

let currentDate = new Date();
let selectedDate = null;
let diaryData = [];

// DOM elements
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const entriesList = document.getElementById("entriesList");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeModal = document.getElementById("closeModal");
const entryTitle = document.getElementById("entryTitle");
const entryNote = document.getElementById("entryNote");
const modalDate = document.getElementById("modalDate");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

// Initialize the app
function init() {
  loadData();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  addBtn.addEventListener("click", openModal);
  saveBtn.addEventListener("click", saveEntry);
  cancelBtn.addEventListener("click", closeModalDialog);
  closeModal.addEventListener("click", closeModalDialog);
  prevMonth.addEventListener("click", () => changeMonth(-1));
  nextMonth.addEventListener("click", () => changeMonth(1));
  
  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalDialog();
    }
  });
}

// Load data from Google Sheets
function loadData() {
  if (SCRIPT_URL === "https://script.google.com/macros/s/AKfycbz_xHIuLTVjcp05xJuUCDvmXgqPvXc5TYmQhRldeao8qXUvADc3aX-tsR6--JdK9iHK5w/exec") {
    console.warn("Please set your Google Apps Script URL in script.js");
    diaryData = [];
    renderCalendar();
    renderEntries();
    return;
  }

  fetch(SCRIPT_URL)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      diaryData = data;
      renderCalendar();
      renderEntries();
    })
    .catch(err => {
      console.error("Error loading data:", err);
      alert("Failed to load diary entries. Please check your Google Script URL and permissions.");
      diaryData = [];
      renderCalendar();
      renderEntries();
    });
}

// Render calendar
function renderCalendar() {
  calendar.innerHTML = "";
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update month/year display
  monthYear.textContent = currentDate.toLocaleString("default", { 
    month: "long", 
    year: "numeric" 
  });
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Monday is first day (0)
  const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();
  
  // Add days from previous month
  for (let i = firstDayAdjusted - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const div = createDayElement(day, true);
    calendar.appendChild(div);
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const div = createDayElement(day, false);
    const dateStr = formatDate(year, month, day);
    
    // Check if this day has entries
    if (diaryData.some(entry => entry.date === dateStr)) {
      div.classList.add("has-entry");
    }
    
    // Mark today
    if (isCurrentMonth && day === todayDate) {
      div.classList.add("today");
    }
    
    // Mark selected date
    if (selectedDate === dateStr) {
      div.classList.add("selected");
    }
    
    div.addEventListener("click", () => selectDate(dateStr, div));
    calendar.appendChild(div);
  }
  
  // Add days from next month to fill grid
  const totalCells = calendar.children.length;
  const remainingCells = 42 - totalCells; // 6 rows * 7 days
  
  for (let day = 1; day <= remainingCells; day++) {
    const div = createDayElement(day, true);
    calendar.appendChild(div);
  }
}

// Create day element
function createDayElement(day, isOtherMonth) {
  const div = document.createElement("div");
  div.className = "calendar-day";
  div.textContent = day;
  
  if (isOtherMonth) {
    div.classList.add("other-month");
  }
  
  return div;
}

// Format date as YYYY-MM-DD
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Select a date
function selectDate(dateStr, element) {
  selectedDate = dateStr;
  
  // Remove selected class from all days
  document.querySelectorAll(".calendar-day").forEach(d => {
    d.classList.remove("selected");
  });
  
  // Add selected class to clicked day
  element.classList.add("selected");
  
  // Render entries for selected date
  renderEntries();
}

// Change month
function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  selectedDate = null;
  renderCalendar();
  renderEntries();
}

// Render entries list
function renderEntries() {
  entriesList.innerHTML = "";
  
  // Get entries for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Generate all days of the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthEntries = [];
  
  for (let day = daysInMonth; day >= 1; day--) {
    const dateStr = formatDate(year, month, day);
    const dayEntries = diaryData.filter(entry => entry.date === dateStr);
    
    monthEntries.push({
      date: dateStr,
      day: day,
      entries: dayEntries
    });
  }
  
  // Render each day
  monthEntries.forEach(dayData => {
    const entryItem = document.createElement("div");
    entryItem.className = "entry-item";
    
    const date = new Date(dayData.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    
    let entryContent = "";
    if (dayData.entries.length > 0) {
      const entry = dayData.entries[0];
      entryContent = `
        <div class="entry-title">${escapeHtml(entry.title)}</div>
        ${entry.note ? `<div class="entry-preview">${escapeHtml(entry.note.substring(0, 50))}${entry.note.length > 50 ? "..." : ""}</div>` : ""}
      `;
      if (dayData.entries.length > 1) {
        entryContent += `<div class="entry-preview">+${dayData.entries.length - 1} more</div>`;
      }
    } else {
      entryContent = '<div class="no-entry">No entry</div>';
    }
    
    entryItem.innerHTML = `
      <div class="entry-date">
        <div class="entry-day">${dayName}</div>
        <div class="entry-number">${dayData.day}</div>
      </div>
      <div class="entry-content">
        ${entryContent}
      </div>
    `;
    
    entryItem.addEventListener("click", () => {
      selectDateByString(dayData.date);
    });
    
    entriesList.appendChild(entryItem);
  });
}

// Select date by string (for entry list clicks)
function selectDateByString(dateStr) {
  selectedDate = dateStr;
  
  // Find the corresponding day in calendar
  const [year, month, day] = dateStr.split("-").map(Number);
  if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
    const dayElements = document.querySelectorAll(".calendar-day:not(.other-month)");
    dayElements.forEach(el => {
      if (parseInt(el.textContent) === day) {
        selectDate(dateStr, el);
      }
    });
  }
}

// Open modal for adding entry
function openModal() {
  if (!selectedDate) {
    alert("Please select a date first");
    return;
  }
  
  const date = new Date(selectedDate);
  const dateDisplay = date.toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  modalDate.textContent = dateDisplay;
  entryTitle.value = "";
  entryNote.value = "";
  
  modal.classList.add("show");
  entryTitle.focus();
}

// Close modal
function closeModalDialog() {
  modal.classList.remove("show");
}

// Save entry to Google Sheets
function saveEntry() {
  const title = entryTitle.value.trim();
  const note = entryNote.value.trim();
  
  if (!title) {
    alert("Please enter a title");
    return;
  }
  
  if (SCRIPT_URL === "https://script.google.com/macros/s/AKfycbz_xHIuLTVjcp05xJuUCDvmXgqPvXc5TYmQhRldeao8qXUvADc3aX-tsR6--JdK9iHK5w/exec") {
    alert("Please set your Google Apps Script URL in script.js to save entries");
    return;
  }
  
  // Disable save button to prevent double submission
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // Important for Google Apps Script
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      date: selectedDate, 
      title: title, 
      note: note 
    })
  })
  .then(() => {
    closeModalDialog();
    
    // Add entry to local data immediately for better UX
    diaryData.push({
      date: selectedDate,
      title: title,
      note: note,
      time: new Date().toISOString()
    });
    
    renderCalendar();
    renderEntries();
    
    // Reload data after a short delay to sync with server
    setTimeout(() => loadData(), 1000);
  })
  .catch(err => {
    console.error("Error saving entry:", err);
    alert("Failed to save entry. Please try again.");
  })
  .finally(() => {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
