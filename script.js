// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Year
$("#year").textContent = new Date().getFullYear();

// Elements
const overlay = $("#portal-overlay");
const sections = $$(".section");
const navLinks = $$(".nav-link");

// Fonction pour afficher une section spécifique
function showSection(id) {
  sections.forEach(s => {
    if (s.id === id) {
      s.removeAttribute("hidden");
    } else {
      s.setAttribute("hidden", "");
    }
  });
  
  // Mise à jour de l'état actif dans la nav
  navLinks.forEach(a => a.removeAttribute("aria-current"));
  const current = navLinks.find(a => a.getAttribute("href") === "#" + id);
  if (current) {
    current.setAttribute("aria-current", "page");
  }
}

// Play portal animation
function playPortal(callback) {
  overlay.classList.add("is-active");
  
  // Exécuter le callback au milieu de l'animation (quand l'écran est noir)
  setTimeout(() => {
    if (callback) callback();
  }, 1000); // Au milieu des 2 secondes
  
  setTimeout(() => {
    overlay.classList.remove("is-active");
  }, 2000);
}

function scrollToTarget(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  // Lancer l'animation avec le changement de section au milieu
  playPortal(() => {
    showSection(id);
    
    // Scroll avec offset pour éviter que le header cache le contenu
    setTimeout(() => {
      const headerHeight = document.querySelector('.site-header').offsetHeight;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20; // 20px de marge supplémentaire
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "auto"
      });
      
      el.focus({ preventScroll: true });
    }, 50);
  });
  
  history.pushState(null, "", "#" + id);
}

// Intercept clicks on nav links
navLinks.forEach(a => {
  a.addEventListener("click", (e) => {
    const hash = a.getAttribute("href");
    if (hash && hash.startsWith("#")) {
      e.preventDefault();
      const id = hash.slice(1);
      scrollToTarget(id);
    }
  });
});

// Update aria-current on scroll (optionnel, pour l'accessibilité)
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.hasAttribute("hidden")) {
      const id = entry.target.id;
      navLinks.forEach(a => a.removeAttribute("aria-current"));
      const current = navLinks.find(a => a.getAttribute("href") === "#" + id);
      if (current) {
        current.setAttribute("aria-current", "page");
      }
    }
  });
}, { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] });

sections.forEach(s => io.observe(s));

// Keyboard shortcuts between sections
addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "PageDown" && 
      e.key !== "ArrowLeft" && e.key !== "PageUp") return;
  
  const ids = sections.map(s => s.id);
  
  // Trouver la section actuellement visible
  let currentId = ids[0];
  for (const s of sections) {
    if (!s.hasAttribute("hidden")) {
      currentId = s.id;
      break;
    }
  }
  
  const idx = ids.indexOf(currentId);
  
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    const nextIdx = (idx + 1) % ids.length;
    scrollToTarget(ids[nextIdx]);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    const prevIdx = (idx - 1 + ids.length) % ids.length;
    scrollToTarget(ids[prevIdx]);
  }
});

// Gérer le chargement initial avec un hash dans l'URL
if (window.location.hash) {
  const id = window.location.hash.slice(1);
  showSection(id);
}

// Gestion du formulaire de contact
const contactForm = $("#contact-form");
const formStatus = $("#form-status");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message")
    };
    
    // Simuler l'envoi (remplacer par un vrai endpoint si besoin)
    formStatus.className = "form-status";
    formStatus.textContent = "Envoi en cours...";
    formStatus.style.display = "block";
    
    // Simulation d'envoi avec délai
    setTimeout(() => {
      // Ici tu pourrais faire un vrai fetch vers ton backend
      // fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
      
      formStatus.className = "form-status success";
      formStatus.textContent = "✓ Message envoyé avec succès ! Je vous recontacterai bientôt.";
      contactForm.reset();
      
      setTimeout(() => {
        formStatus.style.display = "none";
      }, 5000);
    }, 1500);
  });
}