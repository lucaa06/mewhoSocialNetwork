// Real End-to-End Encryption using WebCrypto (ECDH + AES-GCM)
// Private keys never leave the device (stored in localStorage as JWK)
// Server only stores: public keys + encrypted ciphertext + IV

const PRIVATE_KEY_STORE = "mw_e2e_private";
const PUBLIC_KEY_STORE = "mw_e2e_public";

async function generateKeyPair() {
  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  return { privateJwk, publicJwk };
}

export async function getOrCreateKeyPair(): Promise<{ privateJwk: JsonWebKey; publicJwk: JsonWebKey }> {
  const stored = localStorage.getItem(PRIVATE_KEY_STORE);
  const storedPub = localStorage.getItem(PUBLIC_KEY_STORE);
  if (stored && storedPub) {
    return { privateJwk: JSON.parse(stored), publicJwk: JSON.parse(storedPub) };
  }
  const { privateJwk, publicJwk } = await generateKeyPair();
  localStorage.setItem(PRIVATE_KEY_STORE, JSON.stringify(privateJwk));
  localStorage.setItem(PUBLIC_KEY_STORE, JSON.stringify(publicJwk));
  return { privateJwk, publicJwk };
}

async function deriveSharedKey(myPrivateJwk: JsonWebKey, theirPublicJwk: JsonWebKey): Promise<CryptoKey> {
  const myPrivate = await crypto.subtle.importKey("jwk", myPrivateJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
  const theirPublic = await crypto.subtle.importKey("jwk", theirPublicJwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublic },
    myPrivate,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function encryptMessage(plaintext: string, myPrivateJwk: JsonWebKey, theirPublicJwk: JsonWebKey): Promise<{ ciphertext: string; iv: string }> {
  const key = await deriveSharedKey(myPrivateJwk, theirPublicJwk);
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, enc.encode(plaintext));
  return { ciphertext: bufToB64(encrypted), iv: bufToB64(ivBytes.buffer as ArrayBuffer) };
}

export async function decryptMessage(ciphertext: string, iv: string, myPrivateJwk: JsonWebKey, theirPublicJwk: JsonWebKey): Promise<string> {
  try {
    const key = await deriveSharedKey(myPrivateJwk, theirPublicJwk);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBuf(iv) },
      key,
      b64ToBuf(ciphertext)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return "[messaggio non decriptabile]";
  }
}
