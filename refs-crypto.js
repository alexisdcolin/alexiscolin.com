// ─── CV references: the cv-refs.enc format ────────────────────────────────────
// Shared by cv.js, which decrypts the referees to show them, and the terminal's
// `refs` command in scroll.js, which re-encrypts them after an edit. The
// terminal loads this file on demand: visitors of the home page never fetch it.
//
// cv-refs.enc holds, base64-encoded:
//   salt[16] | iv[12] | AES-GCM ciphertext
// with the key derived by PBKDF2-SHA256 over 600 000 iterations — the current
// OWASP figure. It costs half a second on unlock and multiplies the cost of an
// offline attack by the same factor, which is what buys a shorter passphrase.
// The plaintext is a JSON array of { name, role, email, phone }, where role is
// a string or { fr, en }.
var REFS_URL = '/cv-refs.enc';
var REFS_ITERATIONS = 600000;

function b64ToBytes(b64) {
  var bin = atob(b64.trim());
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  var bin = '';
  // Chunked: spreading a large array into fromCharCode overflows the stack
  for (var i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function deriveRefsKey(passphrase, salt, usages) {
  var material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: REFS_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages || ['decrypt']
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

// The content of a new cv-refs.enc, with a fresh salt and IV. Decrypted back
// before it is returned: a broken file would only show up on the next unlock,
// once deployed.
async function encryptRefs(refs, passphrase) {
  var enc = new TextEncoder();
  var plain = JSON.stringify(refs);
  var salt = crypto.getRandomValues(new Uint8Array(16));
  var iv = crypto.getRandomValues(new Uint8Array(12));
  var key = await deriveRefsKey(passphrase, salt, ['encrypt', 'decrypt']);
  var ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(plain)));
  var back = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
  if (new TextDecoder().decode(back) !== plain) throw new Error('roundtrip');

  var bytes = new Uint8Array(28 + ct.length);
  bytes.set(salt, 0);
  bytes.set(iv, 16);
  bytes.set(ct, 28);
  return bytesToB64(bytes) + '\n';
}
