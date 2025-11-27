// Get browser language
const browserLang = navigator.language.slice(0, 2);
let currentLang = ["it", "en"].includes(browserLang) ? browserLang : "it";

// Set initial language
document.documentElement.lang = currentLang;

// Language switching
const langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang;
        setLanguage(currentLang);

        // Update active state
        langButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// Set active language button on load
document.querySelector(`[data-lang="${currentLang}"]`).classList.add("active");
document
    .querySelector(`[data-lang="${currentLang === "it" ? "en" : "it"}"]`)
    .classList.remove("active");

function setLanguage(lang) {
    document.documentElement.lang = lang;
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // Restart rotating text with new language
    startRotatingText();
}

// Rotating text animation
let rotatingInterval;
function startRotatingText() {
    clearInterval(rotatingInterval);
    const rotatingElement = document.querySelector(".rotating-text");
    const words = translations[currentLang]["rotating.words"];
    let currentIndex = 0;

    rotatingInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
        rotatingElement.style.animation = "none";
        setTimeout(() => {
            rotatingElement.textContent = words[currentIndex];
            rotatingElement.style.animation = "fadeIn 0.5s ease";
        }, 50);
    }, 2000);
}

// Initialize
setLanguage(currentLang);
startRotatingText();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll(".feature-card, .step").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
});
