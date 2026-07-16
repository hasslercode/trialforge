const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const USERCODE_PATTERN = /^TF-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

function randomChunk(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/** Opaque progress code, e.g. TF-7K2M-9HQR */
export function generateUserCode(): string {
  return `TF-${randomChunk(4)}-${randomChunk(4)}`;
}

export function normalizeUserCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidUserCode(code: string): boolean {
  return USERCODE_PATTERN.test(normalizeUserCode(code));
}
