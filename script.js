// ========== السلايدر ==========
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) slide.classList.add("active");
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// يتحرك تلقائي كل 5 ثواني
setInterval(nextSlide, 5000);

// ========== عرض العقارات ==========
async function loadProperties() {
  try {
    const response = await fetch("data/properties.json");
    const data = await response.json();
    const container = document.getElementById("property-list");

    container.innerHTML = "";

    data.forEach((prop) => {
      const card = document.createElement("div");
      card.className = "property-card";
      card.innerHTML = `
        <img src="${prop.image}" alt="${prop.title}">
        <div class="property-info">
          <h3>${prop.title}</h3>
          <p>${prop.location}</p>
          <span>${prop.price}</span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading properties:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadProperties);

// ========== تواصل معنا ==========
document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("تم إرسال رسالتك بنجاح ✅");
});
