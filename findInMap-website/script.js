// Detect current language from URL path
const isEnglishPage = window.location.pathname.includes("/en/");
const currentLang = isEnglishPage ? "en" : "it";

// Detect if running locally (file:// protocol) or on a server
const isLocalFile = window.location.protocol === "file:";

// Compute the language-switch target. Supports homepage and arbitrary
// subpages like /mapvest-for-nonprofit/ ↔ /en/mapvest-for-nonprofit/.
function computeLangTarget(newLang) {
    const path = window.location.pathname;

    if (!isLocalFile) {
        // Production: use absolute paths.
        if (newLang === "en" && !isEnglishPage) {
            return "/en" + path;
        }
        if (newLang === "it" && isEnglishPage) {
            return path.replace(/^\/en\//, "/").replace(/^\/en$/, "/");
        }
        return null;
    }

    // Local file:// — compute relative paths against known structure.
    // Known IT pages: /index.html, /<sub>/index.html
    // Known EN pages: /en/index.html, /en/<sub>/index.html
    const fileMatch = path.match(/[^/]+\.html?$/);
    const fileName = fileMatch ? fileMatch[0] : "index.html";
    const dirPath = fileMatch ? path.slice(0, -fileName.length) : path;
    // Trim trailing slash for splitting
    const segments = dirPath.split("/").filter(Boolean);

    if (newLang === "en" && !isEnglishPage) {
        // From IT page, prepend "en/" before the last directory.
        // Homepage:    [...] /findInMap-website/         → en/index.html
        // Subpage:     [...] /findInMap-website/sub/     → ../en/sub/index.html
        const itSubIndex = segments.length;
        // We need to know the website root depth. Without that we approximate:
        // if the page is a subpage, last segment is the subpage name.
        const lastSegment = segments[segments.length - 1];
        const isHomepage =
            !lastSegment || lastSegment === "findInMap-website";
        if (isHomepage) {
            return "en/" + fileName;
        }
        return "../en/" + lastSegment + "/" + fileName;
    }

    if (newLang === "it" && isEnglishPage) {
        // EN homepage:  [...] /findInMap-website/en/                → ../index.html
        // EN subpage:   [...] /findInMap-website/en/sub/            → ../../sub/index.html
        const enIndex = segments.lastIndexOf("en");
        const afterEn = segments.slice(enIndex + 1);
        if (afterEn.length === 0) {
            return "../" + fileName;
        }
        return "../../" + afterEn.join("/") + "/" + fileName;
    }

    return null;
}

// Language switching - redirect to correct page
const langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const newLang = btn.dataset.lang;
        if (newLang === currentLang) return;
        const target = computeLangTarget(newLang);
        if (target) window.location.href = target;
    });
});

// Rotating text animation (only on pages that have it)
let rotatingInterval;
function startRotatingText() {
    const rotatingElement = document.querySelector(".rotating-text");
    if (!rotatingElement) return;
    clearInterval(rotatingInterval);
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
