const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

const overlay = $("#portal-overlay");
const sections = $$(".section");
const navLinks = $$(".nav-link");

function showSection(id) {
  sections.forEach(s => {
    if (s.id === id) {
      s.removeAttribute("hidden");
    } else {
      s.setAttribute("hidden", "");
    }
  });
  
  navLinks.forEach(a => a.removeAttribute("aria-current"));
  const current = navLinks.find(a => a.getAttribute("href") === "#" + id);
  if (current) {
    current.setAttribute("aria-current", "page");
  }
}

function playPortal(callback) {
  overlay.classList.add("is-active");
  
  setTimeout(() => {
    if (callback) callback();
  }, 1000);
  
  setTimeout(() => {
    overlay.classList.remove("is-active");
  }, 2000);
}

function scrollToTarget(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  playPortal(() => {
    showSection(id);
    
    setTimeout(() => {
      const headerHeight = document.querySelector('.site-header').offsetHeight;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "auto"
      });
      
      el.focus({ preventScroll: true });
    }, 50);
  });
  
  history.pushState(null, "", "#" + id);
}

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

const allInternalLinks = $$('a[href^="#"]');
allInternalLinks.forEach(a => {
  if (navLinks.includes(a)) return;
  
  a.addEventListener("click", (e) => {
    const hash = a.getAttribute("href");
    if (hash && hash.startsWith("#") && hash !== "#") {
      e.preventDefault();
      const id = hash.slice(1);
      scrollToTarget(id);
    }
  });
});

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

addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "PageDown" && 
      e.key !== "ArrowLeft" && e.key !== "PageUp") return;
  
  const ids = sections.map(s => s.id);
  
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

if (window.location.hash) {
  const id = window.location.hash.slice(1);
  showSection(id);
}