/* --- Scroll to Top Button --- */
const scrollTopBtn = document.getElementById("scroll-top");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? "flex" : "none";
  });
  scrollTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

/* --- Dark Mode Toggle --- */
const darkModeToggle = document.getElementById("dark-mode-toggle");
if (darkModeToggle) {
  //  Dark Mode In Local Storage
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.innerHTML = '<i class="bi bi-sun"></i>';
  }

  //   Toggle Dark Mode and Save Preference
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isNowDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isNowDark);

    //  Change Icon
    darkModeToggle.innerHTML = isNowDark
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon-stars"></i>';
  });
}

//  1. loadEvents (events.html)

let eventsData = {};

function loadEvents() {
  fetch("assets/js/data.json")
    .then((response) => response.json())
    .then((data) => {
      eventsData = data;

      const homeEventsGrid = document.getElementById("home-events-grid");
      const eventsGrid = document.getElementById("events-grid");

      const categoryMapping = {
        ثقافة: "culture",
        رياضة: "sport",
        موسيقى: "music",
        علمي: "science",
        عائلي: "family",
        تقني: "tech",
      };

      let html = "";
      let id = 0;

      for (const key in eventsData) {
        const event = eventsData[key];
        const cat = categoryMapping[event.category];

        html += `
      <div class="col-md-6 col-lg-4 event-item fade-in-up" data-cat="${cat}" data-loc="${event.location}" data-title="${event.title}">
        <div class="card event-card h-100">
          <img src="${event.image}" class="card-img-top" alt="${event.imageAlt}" />
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between mb-2">
              <span class="badge badge-cat">${event.category}</span>
              <small class="text-muted">${event.date}</small>
            </div>
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text flex-grow-1">${event.shortDescription}</p>
            <div class="event-meta mb-3">
              <div><i class="bi bi-geo-alt-fill"></i> ${event.location}</div>
              <div><i class="bi bi-clock-fill"></i> ${event.time}</div>
            </div>
            <a href="event.html?event=${key}" class="btn btn-primary-custom btn-sm text-white">التفاصيل <i class="bi bi-arrow-left ms-1"></i></a>
          </div>
        </div>
      </div>
    `;
        id++;
        if (id === 6 && homeEventsGrid) homeEventsGrid.innerHTML = html;
      }

      if (eventsGrid) eventsGrid.innerHTML = html;

      const currentEventKey = getSelectedEventKey();
      renderEventDetails(currentEventKey);
      renderRelatedEvents(currentEventKey);
      initEventFilters();
    })
    .catch((error) => console.error("Error loading events:", error));
}

function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderRelatedEvents(currentEventKey) {
  const container = document.getElementById("related-events-list");
  if (!container) return;

  const relatedKeys = Object.keys(eventsData).filter(
    (key) => key !== currentEventKey,
  );

  const randomKeys = shuffleArray(relatedKeys).slice(0, 3);
  container.innerHTML = randomKeys
    .map((key) => {
      const event = eventsData[key];
      return `
        <div class="col-md-4">
          <div class="card event-card">
            <img src="${event.image}" class="card-img-top" alt="${event.imageAlt}" />
            <div class="card-body">
              <span class="badge badge-cat mb-1">${event.category}</span>
              <h6 class="card-title fw-bold">${event.title}</h6>
              <small class="text-muted"><i class="bi bi-calendar3 ms-1"></i> ${event.date}</small>
              <div class="mt-2"><a href="event.html?event=${key}" class="btn btn-primary-custom btn-sm text-white">التفاصيل</a></div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getSelectedEventKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get("event");
}

function getQueryParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get("cat");
}

function renderEventDetails(eventKey) {
  if (!eventKey) return;
  const event = eventsData[eventKey];

  document.title = `${event.title} — دليل فعاليات الجامعة الافتراضية`;
  document.querySelector(".breadcrumb .active").textContent = event.title;
  document.getElementById("event-title").textContent = event.title;
  document.getElementById("event-badge").textContent =
    `${event.emoji} ${event.category}`;
  document.getElementById("event-image").src = event.image;
  document.getElementById("event-image").alt = event.imageAlt;
  document.getElementById("event-description").innerHTML = event.description;
  document.getElementById("event-date").textContent = event.date;
  document.getElementById("event-time").textContent = event.time;
  document.getElementById("event-location").textContent = event.location;
  document.getElementById("event-category").textContent = event.categoryList;
  document.getElementById("event-capacity").textContent = event.capacity;
  document.getElementById("event-entry").textContent = event.entry;
  document.getElementById("event-map-caption").textContent = event.mapCaption;

  const galaryImg = document.querySelectorAll(".info-box .g-2 img");
  for (let i = 0; i < galaryImg.length; i++) {
    galaryImg[i].src = event.galary[i];
  }
}

//  Filtering Events
function initEventFilters() {
  const filterForm = document.getElementById("filter-form");
  if (!filterForm) return;

  const cards = document.querySelectorAll(".event-item");

  function applyFilters() {
    const cat = document.getElementById("filter-cat")?.value || "";
    const loc = document.getElementById("filter-loc")?.value || "";
    const search = document.getElementById("filter-search")?.value || "";

    cards.forEach((card) => {
      const cardCat = card.dataset.cat || "";
      const cardLoc = card.dataset.loc || "";
      const cardTitle = card.dataset.title || "";

      const matchCat = cat === "all" ? true : cardCat === cat;
      const matchLoc = !loc || cardLoc.includes(loc);
      const matchSearch = !search || cardTitle.includes(search);

      card.style.display = matchCat && matchLoc && matchSearch ? "" : "none";
    });
  }

  //   Quick sort buttons
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".cat-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const catSelect = document.getElementById("filter-cat");
      catSelect.value = btn.dataset.cat;
      applyFilters();
    });
  });

  const initialCategory = getQueryParam() || "all";

  const catSelect = document.getElementById("filter-cat");

  if (catSelect) catSelect.value = initialCategory;

  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  const activeCatButton = document.querySelector(
    `.cat-btn[data-cat="${initialCategory}"]`,
  );
  if (activeCatButton) {
    activeCatButton.classList.add("active");
  } else {
    document.querySelector(".cat-btn")?.classList.add("active");
  }

  //  Apply filters on input change
  ["filter-cat", "filter-loc", "filter-search"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", applyFilters);
  });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    filterForm.reset();
    document
      .querySelectorAll(".cat-btn")
      .forEach((b) => b.classList.remove("active"));
    document.querySelector(".cat-btn").classList.add("active");
    cards.forEach((c) => (c.style.display = ""));
  });

  applyFilters();
}

//   2. (contact.html)

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("c-name");
    const email = document.getElementById("c-email");
    const msg = document.getElementById("c-message");
    const alertEl = document.getElementById("form-alert");

    let valid = true;

    //   Reset validation states
    [name, email, msg].forEach((el) => el.classList.remove("is-invalid"));

    //   Name verification
    if (!name.value.trim() || name.value.trim().length < 2) {
      name.classList.add("is-invalid");
      valid = false;
    }

    //  Email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.classList.add("is-invalid");
      valid = false;
    }

    //  Message verification
    if (!msg.value.trim() || msg.value.trim().length < 10) {
      msg.classList.add("is-invalid");
      valid = false;
    }

    //  Display result
    alertEl.classList.remove("d-none", "alert-success", "alert-danger");
    if (valid) {
      alertEl.classList.add("alert-success");
      alertEl.innerHTML =
        '<i class="bi bi-check-circle-fill me-1"></i> تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.';
      form.reset();
    } else {
      alertEl.classList.add("alert-danger");
      alertEl.innerHTML =
        '<i class="bi bi-exclamation-triangle-fill me-1"></i> يرجى تصحيح الأخطاء المُشار إليها.';
    }
    alertEl.classList.remove("d-none");

    setTimeout(() => alertEl.classList.add("d-none"), 5000);
  });
}

//   4. Modal حجز مكان

function initBooking() {
  const bookBtn = document.getElementById("btn-book");
  if (!bookBtn) return;

  bookBtn.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("bookingModal"));
    modal.show();
  });

  document
    .getElementById("booking-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("bookingModal"),
      );
      modal.hide();
      //  Show toast
      const toast = document.getElementById("booking-toast");
      if (toast) {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
      }
    });
}

//   5. مشاركة الفعالية

function initShare() {
  document.getElementById("btn-share")?.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: location.href });
    } else {
      navigator.clipboard.writeText(location.href);
      alert("تم نسخ رابط الفعالية!");
    }
  });
}

/* --- activation the all functions --- */
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
  initContactForm();
  initBooking();
  initShare();
});
