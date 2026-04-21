/*
  Project Title : Event Management Website
  File          : static/js/script.js
  Student Name  : ___________________________
  Roll Number   : ___________________________
  Date          : ___________________________
*/

"use strict";

// ── Hamburger Menu ───────────────────────────────────────────────────────────
(function () {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll(".nav-link").forEach(link =>
      link.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }
})();

// ── Registration Form Validation ─────────────────────────────────────────────
(function () {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  const rules = {
    name:     { el: "name",     errId: "nameError",    validate: v => v.trim().length >= 2, msg: "Full name must be at least 2 characters." },
    email:    { el: "email",    errId: "emailError",   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Please enter a valid email address." },
    phone:    { el: "phone",    errId: "phoneError",   validate: v => /^\d{10}$/.test(v.trim()), msg: "Phone number must be exactly 10 digits." },
    event_id: { el: "event_id", errId: "eventError",   validate: v => v !== "", msg: "Please select an event." },
    tickets:  { el: "tickets",  errId: "ticketsError", validate: v => Number(v) >= 1 && Number(v) <= 10, msg: "Please enter between 1 and 10 tickets." },
  };

  function showError(errId, msg) {
    const el = document.getElementById(errId);
    if (el) el.textContent = msg;
    const input = document.getElementById(errId.replace("Error", ""));
    if (input) input.classList.add("input-error");
  }

  function clearError(errId) {
    const el = document.getElementById(errId);
    if (el) el.textContent = "";
    const input = document.getElementById(errId.replace("Error", ""));
    if (input) input.classList.remove("input-error");
  }

  // Live validation on blur
  Object.values(rules).forEach(rule => {
    const input = document.getElementById(rule.el);
    if (!input) return;
    input.addEventListener("blur", () => {
      rule.validate(input.value) ? clearError(rule.errId) : showError(rule.errId, rule.msg);
    });
    input.addEventListener("input", () => {
      if (input.classList.contains("input-error") && rule.validate(input.value)) clearError(rule.errId);
    });
  });

  // Prevent phone non-digit input
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("keypress", e => {
      if (!/\d/.test(e.key)) e.preventDefault();
    });
  }

  // Submit validation
  form.addEventListener("submit", function (e) {
    let valid = true;
    const errorMessages = [];
    const errBox = document.getElementById("formErrors");

    Object.values(rules).forEach(rule => {
      const input = document.getElementById(rule.el);
      if (!input) return;
      if (!rule.validate(input.value)) {
        valid = false;
        showError(rule.errId, rule.msg);
        errorMessages.push(rule.msg);
      } else {
        clearError(rule.errId);
      }
    });

    if (!valid) {
      e.preventDefault();
      if (errBox) {
        errBox.style.display = "block";
        errBox.innerHTML = "<strong>Please fix the following errors:</strong><ul style='margin:.5rem 0 0 1.25rem'>" +
          errorMessages.map(m => `<li>${m}</li>`).join("") + "</ul>";
        errBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      const btn = document.getElementById("submitBtn");
      if (btn) { btn.textContent = "Processing…"; btn.disabled = true; }
    }
  });
})();

// ── Live Search & Category Filter (Events Page) ───────────────────────────────
(function () {
  const searchInput  = document.getElementById("searchInput");
  const filterBtns   = document.querySelectorAll(".filter-btn");
  const eventCards   = document.querySelectorAll(".event-card");
  const resultCount  = document.getElementById("resultCount");
  const noResults    = document.getElementById("noResults");

  if (!searchInput && !filterBtns.length) return;

  let activeCategory = "all";
  let searchQuery    = "";

  function applyFilters() {
    let visible = 0;
    eventCards.forEach(card => {
      const name     = (card.dataset.name     || "").toLowerCase();
      const venue    = (card.dataset.venue    || "").toLowerCase();
      const category = (card.dataset.category || "");

      const matchSearch   = !searchQuery || name.includes(searchQuery) || venue.includes(searchQuery);
      const matchCategory = activeCategory === "all" || category === activeCategory;

      if (matchSearch && matchCategory) {
        card.style.display = "";
        visible++;
      } else {
        card.style.display = "none";
      }
    });

    if (resultCount) resultCount.textContent = `Showing ${visible} event${visible !== 1 ? "s" : ""}`;
    if (noResults)   noResults.style.display = visible === 0 ? "block" : "none";
  }

  // Search input with debounce
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.toLowerCase().trim();
        applyFilters();
      }, 250);
    });
  }

  // Category filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  });
})();

// ── Admin: Add Event Form Validation ─────────────────────────────────────────
(function () {
  const addForm = document.getElementById("addEventForm");
  if (!addForm) return;

  addForm.addEventListener("submit", function (e) {
    const name  = addForm.querySelector('[name="name"]');
    const date  = addForm.querySelector('[name="date"]');
    const venue = addForm.querySelector('[name="venue"]');

    if (!name.value.trim() || !date.value.trim() || !venue.value.trim()) {
      e.preventDefault();
      alert("Event Name, Date, and Venue are required.");
      return;
    }

    const btn = addForm.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = "Saving…"; btn.disabled = true; }
  });
})();

// ── Auto-dismiss flash messages after 5 seconds ───────────────────────────────
(function () {
  setTimeout(() => {
    document.querySelectorAll(".flash").forEach(f => {
      f.style.transition = "opacity .4s";
      f.style.opacity = "0";
      setTimeout(() => f.remove(), 400);
    });
  }, 5000);
})();
