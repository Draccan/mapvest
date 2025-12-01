// Detect current language from URL path
const isEnglishPage = window.location.pathname.includes("/en/");
const currentLang = isEnglishPage ? "en" : "it";

// Detect if running locally (file:// protocol) or on a server
const isLocalFile = window.location.protocol === "file:";

// Language switching - redirect to correct page
const langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const newLang = btn.dataset.lang;

        // Redirect to the correct page based on language
        if (newLang === "en" && !isEnglishPage) {
            // Use relative path with index.html for local files, clean URL for production
            window.location.href = isLocalFile ? "en/index.html" : "en/";
        } else if (newLang === "it" && isEnglishPage) {
            // Use relative path with index.html for local files, clean URL for production
            window.location.href = isLocalFile ? "../index.html" : "../";
        }
    });
});

// Rotating text animation
let rotatingInterval;
function startRotatingText() {
    clearInterval(rotatingInterval);
    const rotatingElement = document.querySelector(".rotating-text");
    const words = rotatingWords[currentLang];
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

// Initialize rotating text
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
