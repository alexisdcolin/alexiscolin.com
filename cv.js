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

// ─── Skills, grouped by category ─────────────────────────────────────────────
// The name is deliberate: scroll.js already defines a renderSkills(), and both
// files are classic scripts sharing one global scope.
// Most proficient first. Every skill is listed rather than a hand-picked
// subset: the extra keywords are what an ATS matches on. The separator and
// the names share one text node so the PDF carries real spaces and commas —
// Chrome paints no glyph for a space that sits alone between two elements.
function renderCvSkills() {
  var host = document.getElementById('cvSkills');
  if (!host) return;

  var t = translations[currentLang] || translations.fr;
  // French sets a space before the colon, English does not
  var sep = currentLang === 'en' ? ': ' : ' : ';
  host.textContent = '';

  categoryDefs.forEach(function (cat) {
    var names = skillsData
      .filter(function (s) { return s.category === cat; })
      .sort(function (a, b) { return b.level - a.level; })
      .map(function (s) { return s.name; });
    if (!names.length) return;

    var row = document.createElement('p');
    row.className = 'cv-skills__row';

    var label = document.createElement('span');
    label.className = 'cv-skills__cat';
    label.textContent = t['skills.' + cat] || cat;

    row.appendChild(label);
    row.appendChild(document.createTextNode(sep + names.join(', ')));
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

// ─── References, unlocked with a passphrase ──────────────────────────────────
// The site is static, so anything shipped to the browser is readable by anyone.
// The referees' names and contact details therefore travel as AES-GCM
// ciphertext in cv-refs.enc and are only ever legible to someone holding the
// passphrase. Decrypted values live in memory for the tab's lifetime — never in
// localStorage, never written back into the served page.
//
// cv-refs.enc holds, base64-encoded:
//   salt[16] | iv[12] | AES-GCM ciphertext
// with the key derived by PBKDF2-SHA256 over 600 000 iterations — the current
// OWASP figure. It costs half a second on unlock and multiplies the cost of an
// offline attack by the same factor, which is what buys a shorter passphrase.
var REFS_URL = '/cv-refs.enc';
var REFS_ITERATIONS = 600000;

function b64ToBytes(b64) {
  var bin = atob(b64.trim());
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveRefsKey(passphrase, salt) {
  var material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: REFS_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

// Throws on a wrong passphrase: AES-GCM authenticates, so a bad key fails the
// tag check rather than returning plausible-looking garbage.
async function decryptRefs(passphrase) {
  var res = await fetch(REFS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('missing');
  var blob = b64ToBytes(await res.text());
  var key = await deriveRefsKey(passphrase, blob.slice(0, 16));
  var plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: blob.slice(16, 28) }, key, blob.slice(28)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

function refIcon(id) {
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ico');
  var use = document.createElementNS(NS, 'use');
  use.setAttribute('href', '#' + id);
  svg.appendChild(use);
  return svg;
}

function refLine(iconId, value) {
  var p = document.createElement('p');
  p.className = 'cv-ref__line';
  p.appendChild(refIcon(iconId));
  p.appendChild(document.createTextNode(value));
  return p;
}

function renderRefs(refs) {
  var host = document.getElementById('cvRefs');
  if (!host) return;
  host.textContent = '';

  var list = document.createElement('div');
  list.className = 'cv-refs-list';

  refs.forEach(function (ref) {
    var item = document.createElement('div');
    item.className = 'cv-ref';

    var name = document.createElement('p');
    name.className = 'cv-ref__name';
    name.textContent = ref.name;
    item.appendChild(name);

    // Email and phone share a line: on four referee lines the block costs
    // 26mm and tips the printed CV onto a third page.
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

    if (ref.role) {
      var role = document.createElement('p');
      role.className = 'cv-ref__role';
      role.textContent = ref.role;
      item.appendChild(role);
    }

    list.appendChild(item);
  });

  host.appendChild(list);
}

// Restores the public wording, keeping the data-i18n hook so a later language
// switch still translates it.
function lockRefs() {
  var host = document.getElementById('cvRefs');
  if (!host) return;
  var t = translations[currentLang] || translations.fr;
  host.textContent = '';
  var p = document.createElement('p');
  p.className = 'cv-refs';
  p.setAttribute('data-i18n', 'cv.refs.body');
  p.textContent = t['cv.refs.body'];
  host.appendChild(p);
}

// The button always shows the action it performs, not the current state.
function setRefsButton(btn, unlocked) {
  var t = translations[currentLang] || translations.fr;
  btn.querySelector('use').setAttribute('href', unlocked ? '#i-lock' : '#i-unlock');
  btn.querySelector('span').textContent = unlocked ? t['cv.refs.lock'] : t['cv.refs.unlock'];
  btn.querySelector('span').setAttribute('data-i18n', unlocked ? 'cv.refs.lock' : 'cv.refs.unlock');
}

var refsBtn = document.getElementById('refsUnlock');
if (refsBtn) {
  // Held for the tab's lifetime so locking and unlocking again — to print both
  // versions in one sitting — does not mean retyping the passphrase. Closing
  // the tab drops it; nothing is ever persisted.
  var refsPlain = null;

  refsBtn.addEventListener('click', async function () {
    var t = translations[currentLang] || translations.fr;

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

    var passphrase = prompt(t['cv.refs.prompt']);
    if (!passphrase) return;
    try {
      refsPlain = await decryptRefs(passphrase);
      renderRefs(refsPlain);
      setRefsButton(refsBtn, true);
    } catch (e) {
      alert(e.message === 'missing' ? t['cv.refs.absent'] : t['cv.refs.wrong']);
    }
  });
}
