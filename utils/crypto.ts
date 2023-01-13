function byteToHex(byte: number): string {
  return `0${byte.toString(16)}`.slice(-2);
}

function generateRandomID() {
  const arr = new Uint8Array(10);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, byteToHex).join("");
}

export function generateCollaborationLink(url: string) {
  const id = generateRandomID();
  return `${url}?room=${id}`;
}
