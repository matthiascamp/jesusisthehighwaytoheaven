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

  /* COMMENTS FOR PAGES THAT DO NOT ALREADY PROVIDE THEIR OWN WIDGET */
  function commentsPageId() {
    var path = window.location.pathname.toLowerCase();
    var pages = [
      ['pastor-don', 'pastor-don'],
      ['to-god-be-the-glory', 'to-god-be-the-glory'],
      ['gods-transcendence', 'gods-transcendence'],
      ['gods-epilogue', 'gods-epilogue'],
      ['god-owns-everything', 'god-owns-everything'],
      ['empowerment', 'empowerment'],
      ['church-worldliness-corruption', 'gods-roadmap'],
      ['i%20am%20holy%20spirit%20god%20and%20this%20is%20my%20personal%20testimony', 'personal-testimony'],
      ['i am holy spirit god and this is my personal testimony', 'personal-testimony'],
      ['gods-spectrum-to-life', 'gods-spectrum-to-life']
    ];
    for (var i = 0; i < pages.length; i++) {
      if (path.indexOf(pages[i][0]) !== -1) return pages[i][1];
    }
    return 'home';
  }

  function installCommentsWidget() {
    // Older pages wrap the widget in .comments-card without .comments-section.
    // Detect the actual controls as well as either wrapper to prevent duplicates.
    if (document.querySelector('.comments-section, .comments-card, #commentList, .comment-form')) return;
    var footer = document.querySelector('footer');
    if (!footer) return;

    var section = document.createElement('section');
    section.className = 'comments-section';
    section.innerHTML =
      '<div class="comments-card"><div class="comments-heading">' +
      '<span class="ch-ornament">&#10013;</span><h3>Reflections &amp; Comments</h3></div>' +
      '<div class="like-row"><button class="like-btn" type="button"><span class="heart">&#9825;</span> Like</button>' +
      '<span class="like-count"></span></div><div class="comment-list"></div>' +
      '<p class="comment-form-heading">Leave a Reflection</p><form class="comment-form">' +
      '<input class="comment-name" type="text" placeholder="Your name" maxlength="80" required>' +
      '<textarea class="comment-body-input" placeholder="Share your thoughts or reflection..." maxlength="1000" required></textarea>' +
      '<button type="submit" class="comment-submit">Post Reflection &#10013;</button></form></div>';
    footer.parentNode.insertBefore(section, footer);

    var url = 'https://ufnswkzujhavqcxxmjee.supabase.co';
    var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbnN3a3p1amhhdnFjeHhtamVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjk3MzcsImV4cCI6MjA5MTY0NTczN30.1cUftC26qif5ShzDFn37-4UpO5amfFfdGE9qDPBT6Cg';
    var pageId = commentsPageId();
    var list = section.querySelector('.comment-list');
    var likeButton = section.querySelector('.like-btn');
    var likeCount = section.querySelector('.like-count');

    function escapeHtml(value) {
      return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async function api(path, options) {
      options = options || {};
      var headers = options.headers || {};
      delete options.headers;
      var response = await fetch(url + '/rest/v1/' + path, Object.assign({
        headers: Object.assign({ apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, headers)
      }, options));
      if (!response.ok) throw new Error('Request failed: ' + response.status);
      if (response.status === 204 || response.status === 201) return null;
      var text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    async function loadComments() {
      list.innerHTML = '<p class="comments-status">Loading reflections&hellip;</p>';
      try {
        var rows = await api('comments?page_id=eq.' + encodeURIComponent(pageId) + '&order=created_at.asc&select=name,body,created_at');
        if (!rows || !rows.length) {
          list.innerHTML = '<p class="comments-status">Be the first to leave a reflection.</p>';
          return;
        }
        list.innerHTML = rows.map(function (row) {
          var date = new Date(row.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
          return '<div class="comment-item"><div class="comment-header"><span class="comment-ornament">&#10013;</span>' +
            '<div class="comment-byline"><span class="comment-author">' + escapeHtml(row.name) + '</span>' +
            '<span class="comment-date">' + date + '</span></div></div><p class="comment-body">' + escapeHtml(row.body) + '</p></div>';
        }).join('');
      } catch (error) {
        list.innerHTML = '<p class="comments-status comments-error">Reflections are temporarily unavailable.</p>';
      }
    }

    async function loadLikes() {
      var liked = localStorage.getItem('liked_' + pageId) === '1';
      likeButton.classList.toggle('liked', liked);
      likeButton.querySelector('.heart').textContent = liked ? '\u2665' : '\u2661';
      try {
        var rows = await api('likes?page_id=eq.' + encodeURIComponent(pageId) + '&select=count');
        var count = rows && rows[0] ? rows[0].count : 0;
        likeCount.textContent = count ? count + ' ' + (count === 1 ? 'person' : 'people') + ' liked this' : '';
      } catch (error) { likeCount.textContent = ''; }
    }

    likeButton.addEventListener('click', async function () {
      var nowLiked = !likeButton.classList.contains('liked');
      likeButton.classList.toggle('liked', nowLiked);
      likeButton.querySelector('.heart').textContent = nowLiked ? '\u2665' : '\u2661';
      localStorage.setItem('liked_' + pageId, nowLiked ? '1' : '0');
      try {
        var rows = await api('likes?page_id=eq.' + encodeURIComponent(pageId) + '&select=count');
        var current = rows && rows[0] ? rows[0].count : 0;
        var next = Math.max(0, current + (nowLiked ? 1 : -1));
        await api('likes', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ page_id: pageId, count: next }) });
        likeCount.textContent = next ? next + ' ' + (next === 1 ? 'person' : 'people') + ' liked this' : '';
      } catch (error) { loadLikes(); }
    });

    section.querySelector('.comment-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      var nameInput = section.querySelector('.comment-name');
      var bodyInput = section.querySelector('.comment-body-input');
      var submit = section.querySelector('.comment-submit');
      var name = nameInput.value.trim();
      var body = bodyInput.value.trim();
      if (!name || !body) return;
      submit.disabled = true;
      submit.textContent = 'Posting\u2026';
      try {
        await api('comments', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ page_id: pageId, name: name, body: body }) });
        nameInput.value = '';
        bodyInput.value = '';
        await loadComments();
      } catch (error) {
        alert('Could not post your reflection. Please try again.');
      } finally {
        submit.disabled = false;
        submit.textContent = 'Post Reflection \u271d';
      }
    });

    Promise.all([loadComments(), loadLikes()]);
  }

  installCommentsWidget();

})();
