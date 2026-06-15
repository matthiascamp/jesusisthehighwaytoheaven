/*  Google Doc CMS for jesusisthehighwaytoheaven.com
 *  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *  How it works:
 *  1. Ed creates Google Docs in the same Drive folder as the book chapters
 *  2. He names them exactly: "CMS Testimony", "CMS Revelation", or "CMS Welcome"
 *  3. This script finds those docs, fetches their text, and replaces the
 *     matching section on the page automatically.
 *  4. If a doc doesn't exist yet, the static HTML stays as fallback.
 *
 *  Ed just types plain text. Blank lines between paragraphs. That's it.
 */
(function () {
  var API_KEY   = 'AIzaSyDop159M8vugSx8i5JmdCsPgFqkYyqoN3w';
  var FOLDER_ID = '1xg0zyukw67FFEyFLYkgcQqEX3GGMUD2X';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /* â”€â”€ Section config â”€â”€ */
  var SECTIONS = {
    'CMS Testimony':  { targetId: 'cms-testimony',  pClass: 'home-bio'  },
    'CMS Revelation': { targetId: 'cms-revelation', pClass: 'home-text' },
    'CMS Welcome':    { targetId: 'cms-welcome',    pClass: 'home-text' }
  };

  /* â”€â”€ Cache helpers â”€â”€ */
  function getCached(docId) {
    try {
      var raw = sessionStorage.getItem('cms_' + docId);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (Date.now() - data.time < CACHE_TTL) return data.text;
    } catch (e) {}
    return null;
  }
  function setCache(docId, text) {
    try {
      sessionStorage.setItem('cms_' + docId, JSON.stringify({ time: Date.now(), text: text }));
    } catch (e) {}
  }

  /* â”€â”€ Fetch a Google Doc as plain text â”€â”€ */
  function fetchDocText(docId) {
    var cached = getCached(docId);
    if (cached) return Promise.resolve(cached);

    var url =
      'https://www.googleapis.com/drive/v3/files/' + docId +
      '/export?mimeType=text%2Fplain&key=' + API_KEY;

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.text();
      })
      .then(function (text) {
        setCache(docId, text);
        return text;
      });
  }

  /* â”€â”€ Parse plain text â†’ HTML â”€â”€ */
  function parseText(text, pClass) {
    // Normalise line endings
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split into paragraphs by blank lines
    var blocks = text.split(/\n\s*\n/).filter(function (b) { return b.trim(); });
    var html = '';
    var isFirstP = true;

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i].trim();

      // Choose class — first paragraph in home-text sections gets the lead style
      var cls = pClass;
      if (isFirstP && pClass === 'home-text') {
        cls = 'home-text home-text--lead';
        isFirstP = false;
      }

      // Collapse internal single newlines into spaces
      var content = block.replace(/\n/g, ' ');

      html += '<p class="' + cls + '">' + content + '</p>\n';
    }

    return html;
  }

  /* â”€â”€ Main loader â”€â”€ */
  function loadCMS() {
    // Check if any target elements exist on this page
    var hasTargets = false;
    for (var name in SECTIONS) {
      if (document.getElementById(SECTIONS[name].targetId)) {
        hasTargets = true;
        break;
      }
    }
    if (!hasTargets) return;

    // Find Google Docs in the Drive folder
    var q = "'" + FOLDER_ID + "' in parents and mimeType='application/vnd.google-apps.document' and trashed=false";
    var params = new URLSearchParams({
      q:      q,
      fields: 'files(id,name)',
      key:    API_KEY
    });

    fetch('https://www.googleapis.com/drive/v3/files?' + params)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var files = data.files || [];
        files.forEach(function (file) {
          var section = SECTIONS[file.name];
          if (!section) return;

          var target = document.getElementById(section.targetId);
          if (!target) return;

          fetchDocText(file.id)
            .then(function (text) {
              var html = parseText(text, section.pClass);
              if (html.trim()) target.innerHTML = html;
            })
            .catch(function () { /* keep static fallback */ });
        });
      })
      .catch(function () { /* keep static fallback */ });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCMS);
  } else {
    loadCMS();
  }
})();
