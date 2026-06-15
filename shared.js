/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Jesus is the Highway to Heaven — Shared JS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

(function () {

  /* â”€â”€ SCROLL REVEAL â”€â”€ */
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* â”€â”€ HEADER SLIDESHOW â”€â”€ */
  var hdrSlides = document.querySelectorAll('.hdr-slide');
  if (hdrSlides.length > 1) {
    var activeIdx = 0;
    hdrSlides.forEach(function (s, i) { if (s.classList.contains('active')) activeIdx = i; });
    setInterval(function () {
      hdrSlides[activeIdx].classList.remove('active');
      activeIdx = (activeIdx + 1) % hdrSlides.length;
      hdrSlides[activeIdx].classList.add('active');
    }, 7000);
  }

  /* â”€â”€ HAMBURGER NAV â”€â”€ */
  var btn = document.getElementById('navHamburger');
  var links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      links.classList.toggle('open');
      btn.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    document.addEventListener('click', function () {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
    links.addEventListener('click', function () {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  }

  /* â”€â”€ NAV SHRINK ON SCROLL â”€â”€ */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var scrolled = false;
    window.addEventListener('scroll', function () {
      var shouldShrink = window.scrollY > 60;
      if (shouldShrink !== scrolled) {
        scrolled = shouldShrink;
        nav.style.height = scrolled ? '46px' : '';
        nav.style.background = scrolled ? 'rgba(7,16,31,0.95)' : '';
      }
    }, { passive: true });
  }

})();
