export interface FilePayload {
  name: string;
  size: number;
  mimeType: string;
  base64: string;
  textPreview?: string;
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp.'));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file, 'utf-8');
  });
}

export function base64Encode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function toFilePayload(file: File): Promise<FilePayload> {
  const [buffer, text] = await Promise.allSettled([readFileAsArrayBuffer(file), readFileAsText(file)]);
  if (buffer.status === 'rejected') {
    throw buffer.reason;
  }
  const base64 = base64Encode(buffer.value);
  const textPreview = text.status === 'fulfilled' ? text.value.slice(0, 400) : undefined;
  return {
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    base64,
    textPreview,
  };
}
