// ─── Print view of the CV ─────────────────────────────────────────────────────
// Structure lives in cv.html, wording in i18n.js, the skills catalogue in
// skills-data.js. This file only renders what would be tedious by hand and
// wires the print button.

// ─── ?lang= wins over the stored preference ──────────────────────────────────
// Someone following cv.html?lang=en is asking for that language explicitly,
// whatever the toggle remembered from an earlier visit.
(function () {
  var wanted = new URLSearchParams(location.search).get('lang');
  if ((wanted === 'fr' || wanted === 'en') && wanted !== currentLang) {
    currentLang = wanted;
    applyLang(wanted);
  }
})();

// ?print=1: iOS prints the page around a frame, so the dialog's print button
// sends it here instead, and the page prints itself
if (new URLSearchParams(location.search).get('print') === '1') {
  window.addEventListener('load', function () { window.print(); });
}

// ─── Skills, grouped by category ─────────────────────────────────────────────
// Most proficient first. Every skill is listed unless flagged `cv: false`:
// the extra keywords are what an ATS matches on. A family names its tools in
// brackets after it, "AWS (Lambda, S3…)", and shows as soon as one of them
// does. Names and separators share text nodes so the PDF carries real spaces
// and commas — Chrome paints no glyph for a space that sits alone between two
// elements; only a family's own name is an element, set apart from the row's
// category. The CV pairs up the site's smaller categories: two rows more and
// the version with the references runs onto a third page. A row is named
// after its first category, under the cv.skills.* key when the pair needs one.
var CV_SKILL_ROWS = [['dataeng'], ['lang', 'db'], ['cloud'], ['bi'], ['devops', 'pm']];

function renderCvSkills() {
  var host = document.getElementById('cvSkills');
  if (!host) return;

  var tr = t();
  // French sets a space before the colon, English does not
  var sep = currentLang === 'en' ? ': ' : ' : ';
  var byLevel = function (a, b) { return b.level - a.level; };
  var onCv = function (s) { return s.cv !== false; };
  var toolsOf = function (s) {
    return skillsData.filter(function (x) { return x.parent === s.id && onCv(x); }).sort(byLevel);
  };
  host.textContent = '';

  CV_SKILL_ROWS.forEach(function (cats) {
    // Text runs and family names, in reading order
    var parts = [];
    cats.forEach(function (cat) {
      skillsData
        .filter(function (s) { return s.category === cat && !s.parent && (onCv(s) || toolsOf(s).length); })
        .sort(byLevel)
        .forEach(function (s) {
          var tools = toolsOf(s);
          parts.push(parts.length ? ', ' : sep);
          if (!tools.length) return parts.push(skillLabel(s));
          var fam = document.createElement('span');
          fam.className = 'cv-skills__fam';
          fam.textContent = skillLabel(s);
          parts.push(fam, ' (' + tools.map(skillLabel).join(', ') + ')');
        });
    });
    if (!parts.length) return;

    var row = document.createElement('p');
    row.className = 'cv-skills__row';

    var label = document.createElement('span');
    label.className = 'cv-skills__cat';
    label.textContent = tr['cv.skills.' + cats[0]] || tr['skills.' + cats[0]] || cats[0];
    row.appendChild(label);

    // Neighbouring strings join into one text node
    var text = '';
    parts.forEach(function (part) {
      if (typeof part === 'string') { text += part; return; }
      row.appendChild(document.createTextNode(text));
      row.appendChild(part);
      text = '';
    });
    if (text) row.appendChild(document.createTextNode(text));
    host.appendChild(row);
  });
}

renderCvSkills();

// applyLang() rewrites <html lang>, so this catches every language change
// without cv.js having to know how the toggle works.
new MutationObserver(renderCvSkills).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
});

// ─── Print ────────────────────────────────────────────────────────────────────
var printBtn = document.getElementById('cvPrint');
if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

// Browsers name the saved PDF after the title. Swapped on beforeprint rather
// than in the button handler, so Cmd+P gets the same file name. English says
// "resume": in North America a CV is the long academic document.
var screenTitle = document.title;
window.addEventListener('beforeprint', function () {
  document.title = currentLang === 'en' ? 'Alexis-Colin-Resume' : 'Alexis-Colin-CV';
});
window.addEventListener('afterprint', function () { document.title = screenTitle; });

// ─── References, unlocked with a passphrase ──────────────────────────────────
// The site is static, so anything shipped to the browser is readable by anyone.
// The referees' names and contact details therefore travel as AES-GCM
// ciphertext in cv-refs.enc and are only ever legible to someone holding the
// passphrase. Decrypted values live in memory for the tab's lifetime — never in
// localStorage, never written back into the served page. The file format and
// decryptRefs() live in refs-crypto.js, shared with the terminal's `refs`.

function refIcon(id) {
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ico');
  var use = document.createElementNS(NS, 'use');
  use.setAttribute('href', '#' + id);
  svg.appendChild(use);
  return svg;
}

// One referee under the other: side by side, the PDF reads both names, then
// both contact lines, one person's email next to the other's phone. Name and
// role share the first line, email and phone the second, so the block costs
// one line more than the old two-column grid and the CV stays on two pages.
function renderRefs(refs) {
  var host = document.getElementById('cvRefs');
  if (!host) return;
  host.textContent = '';

  var list = document.createElement('div');
  list.className = 'cv-refs-list';

  refs.forEach(function (ref) {
    var item = document.createElement('div');
    item.className = 'cv-ref';

    var head = document.createElement('p');
    head.className = 'cv-ref__head';
    var name = document.createElement('span');
    name.className = 'cv-ref__name';
    name.textContent = ref.name;
    head.appendChild(name);
    var roleText = typeof ref.role === 'object' && ref.role
      ? ref.role[currentLang] || ref.role.fr
      : ref.role;
    if (roleText) {
      var role = document.createElement('span');
      role.className = 'cv-ref__role';
      // The dash travels with the role: a space alone between two elements
      // gets no glyph in the PDF, and the name would run into the role.
      role.textContent = ' — ' + roleText;
      head.appendChild(role);
    }
    item.appendChild(head);

    var contact = document.createElement('p');
    contact.className = 'cv-ref__line';
    if (ref.email) {
      contact.appendChild(refIcon('i-mail'));
      contact.appendChild(document.createTextNode(ref.email));
    }
    if (ref.phone) {
      contact.appendChild(refIcon('i-phone'));
      contact.appendChild(document.createTextNode(ref.phone));
    }
    item.appendChild(contact);

    list.appendChild(item);
  });

  host.appendChild(list);
}

// Restores the public wording, keeping the data-i18n hook so a later language
// switch still translates it.
function lockRefs() {
  var host = document.getElementById('cvRefs');
  if (!host) return;
  host.textContent = '';
  var p = document.createElement('p');
  p.className = 'cv-refs';
  p.setAttribute('data-i18n', 'cv.refs.body');
  p.textContent = t()['cv.refs.body'];
  host.appendChild(p);
}

// The button always shows the action it performs, not the current state.
function setRefsButton(btn, unlocked) {
  btn.querySelector('use').setAttribute('href', unlocked ? '#i-lock' : '#i-unlock');
  btn.querySelector('span').textContent = t()[unlocked ? 'cv.refs.lock' : 'cv.refs.unlock'];
  btn.querySelector('span').setAttribute('data-i18n', unlocked ? 'cv.refs.lock' : 'cv.refs.unlock');
}

var refsBtn = document.getElementById('refsUnlock');
// Held for the tab's lifetime so locking and unlocking again — to print both
// versions in one sitting — does not mean retyping the passphrase. Closing
// the tab drops it; nothing is ever persisted.
var refsPlain = null;

// Decrypts, shows and keeps the list; rejects with decryptRefs()'s error
function unlockRefs(passphrase) {
  return decryptRefs(passphrase).then(function (refs) {
    refsPlain = refs;
    renderRefs(refs);
    if (refsBtn) setRefsButton(refsBtn, true);
  });
}

if (refsBtn) {
  // The roles are data, not data-i18n keys: shown refs are rebuilt on a
  // language change, the same way the skills are.
  new MutationObserver(function () {
    if (refsPlain && document.querySelector('#cvRefs .cv-ref')) renderRefs(refsPlain);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  refsBtn.addEventListener('click', async function () {
    if (refsPlain && document.querySelector('#cvRefs .cv-ref')) {
      lockRefs();
      setRefsButton(refsBtn, false);
      return;
    }

    if (refsPlain) {
      renderRefs(refsPlain);
      setRefsButton(refsBtn, true);
      return;
    }

    var passphrase = prompt(t()['cv.refs.prompt']);
    if (!passphrase) return;
    try {
      await unlockRefs(passphrase);
    } catch (e) {
      alert(t()[e.message === 'missing' ? 'cv.refs.absent' : 'cv.refs.wrong']);
    }
  });
}

// ─── Inside the site's CV dialog ─────────────────────────────────────────────
// The dialog drives this page through messages: opened from a file:// copy,
// the frame counts as another origin and messages are the only way in. Its
// buttons replace the toolbar, which cv.css hides here; the references
// passphrase comes from its own field, not a prompt().
if (window.self !== window.top) (function () {
  function post(msg) {
    msg.cv = true;
    window.parent.postMessage(msg, MSG_ORIGIN);
  }

  // The references button — state, label, icon — for the dialog's own
  function sendRefs() {
    if (!refsBtn) return;
    var span = refsBtn.querySelector('span');
    post({
      type: 'refs',
      state: !refsPlain ? 'locked' : document.querySelector('#cvRefs .cv-ref') ? 'shown' : 'hidden',
      label: span.textContent,
      key: span.getAttribute('data-i18n'),
      icon: refsBtn.querySelector('use').getAttribute('href')
    });
  }

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || e.data.cv !== true) return;
    var m = e.data;
    if (m.type === 'lang') {
      if (translations[m.lang] && m.lang !== currentLang) {
        currentLang = m.lang;
        applyLang(m.lang);
      }
    } else if (m.type === 'print') {
      window.print();
    } else if (m.type === 'refs') {
      // Shows or hides the list once decrypted
      if (refsPlain && refsBtn) refsBtn.click();
    } else if (m.type === 'unlock') {
      unlockRefs(m.passphrase).then(function () {
        post({ type: 'unlock', ok: true });
      }, function (err) {
        post({ type: 'unlock', ok: false, error: err && err.message === 'missing' ? 'missing' : 'wrong' });
      });
    }
  });

  // Escape closes the dialog; ⌘P / Ctrl+P prints this frame, not the page
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      post({ type: 'key', key: 'Escape' });
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      window.print();
    }
  });

  // A link would otherwise open inside the sheet
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    a.target = '_blank';
    a.rel = 'noopener';
  });

  if (refsBtn) {
    new MutationObserver(sendRefs).observe(refsBtn, { subtree: true, childList: true, characterData: true, attributes: true });
  }
  post({ type: 'ready' });
  sendRefs();
})();
