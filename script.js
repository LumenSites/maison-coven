(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery = window.matchMedia("(max-width: 980px)");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    syncInert();
  }

  function syncInert() {
    if (!nav || !toggle) return;
    var mobile = mobileQuery.matches;
    var open = toggle.getAttribute("aria-expanded") === "true";
    if (mobile && !open) nav.setAttribute("inert", "");
    else nav.removeAttribute("inert");
  }

  if (toggle && nav) {
    syncInert();

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      setNav(!open);
      if (!open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) setNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;

      if (event.key === "Escape") {
        setNav(false);
        toggle.focus();
        return;
      }

      if (event.key !== "Tab") return;
      var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a")));
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (!mobileQuery.matches && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
      }
      syncInert();
    });
  }

  document.querySelectorAll(".faq-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
      var item = button.closest(".faq-item");
      if (item) item.classList.toggle("is-open", !expanded);
    });
  });

  var revealEls = document.querySelectorAll("[data-reveal]");

  function show(el) {
    el.classList.add("is-in");
  }

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(show);
    return;
  }

  revealEls.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) show(el);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach(function (el) {
    if (!el.classList.contains("is-in")) observer.observe(el);
  });
})();
