// Initial data structure
const freshData = {
  touched: 0,
  submitted: 0,
  reclassed: 0,
  total: 0,
  ar: 0,
  other: Array(4).fill(""),
};

// Countable data types that contribute to total
const countableData = ["touched", "submitted", "reclassed"];

// Current app data
let data = {};

// Initialize data from localStorage or use fresh data
function initializeData() {
  const localData = localStorage.getItem("productivityData");
  if (localData) {
    data = JSON.parse(localData);
  } else {
    data = { ...freshData };
    localStorage.setItem("productivityData", JSON.stringify(data));
  }
  updateDisplay();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("productivityData", JSON.stringify(data));
}

// Update all display elements
function updateDisplay() {
  // Update counter displays
  document.querySelector('[data-counter="touched"]').textContent = data.touched;
  document.querySelector('[data-counter="submitted"]').textContent =
    data.submitted;
  document.querySelector('[data-counter="reclassed"]').textContent =
    data.reclassed;
  document.querySelector('[data-counter="total"]').textContent = data.total;

  // Update AR collected input
  document.getElementById("arCollected").value = data.ar;

  // Update other activities spans
  const spans = document.querySelectorAll(".editable-span");
  spans.forEach((span, index) => {
    span.textContent = data.other[index] || "";
  });
}

// Handle counter button clicks
function handleCounterClick(event) {
  if (!event.target.classList.contains("counter-btn")) return;

  const action = event.target.dataset.action;
  const counterType = event.target.dataset.counter;

  if (!countableData.includes(counterType)) return;

  const oldValue = data[counterType];

  if (action === "increment") {
    data[counterType]++;
  } else if (action === "decrement" && data[counterType] > 0) {
    data[counterType]--;
  }

  // Update total based on the change
  const change = data[counterType] - oldValue;
  data.total += change;

  // Update display and save
  updateDisplay();
  saveData();
}

// Handle AR collected input change
function handleARChange(event) {
  const value = parseInt(event.target.value) || 0;
  data.ar = Math.max(0, value); // Ensure non-negative
  saveData();
}

// Handle other activities span clicks (convert to textarea for editing)
function handleSpanClick(event) {
  if (!event.target.classList.contains("editable-span")) return;

  const span = event.target;
  const index = parseInt(span.dataset.index);
  const currentText = data.other[index] || "";

  // Create textarea
  const textarea = document.createElement("textarea");
  textarea.value = currentText;
  textarea.dataset.index = index;
  textarea.className = "editing-textarea";

  // Apply styles
  const computedStyle = window.getComputedStyle(span);
  textarea.style.fontSize = computedStyle.fontSize;
  textarea.style.color = computedStyle.color;
  textarea.style.padding = computedStyle.padding;
  textarea.style.borderRadius = computedStyle.borderRadius;
  textarea.style.border = computedStyle.border;
  textarea.style.background = computedStyle.background;
  textarea.style.width = "100%";
  textarea.style.boxSizing = "border-box";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.minHeight = "2.2em";

  // Replace span with textarea
  span.parentNode.replaceChild(textarea, span);
  textarea.focus();
  textarea.select();

  // Auto-resize
  autoResizeTextarea(textarea);

  // Handle blur (save and convert back to span)
  textarea.addEventListener("blur", function () {
    saveTextareaContent(textarea, index);
  });

  // Handle Enter key (save and convert back to span)
  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
  });

  // Handle input for auto-resize
  textarea.addEventListener("input", function () {
    autoResizeTextarea(textarea);
  });
}

// Save textarea content and convert back to span
function saveTextareaContent(textarea, index) {
  const content = textarea.value;
  data.other[index] = content;
  saveData();

  // Create new span
  const span = document.createElement("span");
  span.className = "editable-span";
  span.dataset.index = index;
  span.textContent = content || "";

  // Replace textarea with span
  textarea.parentNode.replaceChild(span, textarea);
}

// Auto-resize textarea based on content
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.max(textarea.scrollHeight, 35) + "px";
}

// Reset all data
function resetData() {
  data = { ...freshData };
  updateDisplay();
  saveData();
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeData();

  // Add event listeners
  document.addEventListener("click", handleCounterClick);
  document.addEventListener("click", handleSpanClick);
  document
    .getElementById("arCollected")
    .addEventListener("input", handleARChange);
  document.getElementById("resetBtn").addEventListener("click", resetData);
});
