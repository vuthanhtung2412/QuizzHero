import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BACKEND_URL } from "@/const"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function createSession() {
  const response = await fetch(`${BACKEND_URL}/session`, {
    method: 'POST',
  });

  // Check if the response is OK
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // Parse the JSON and type it
  const data: { session_id: number } = await response.json();

  if (!data?.session_id) {
    return new Error('Could not create session');
  }
  return data.session_id;
}

async function sendPhotos(files: FileList | File[], url: string): Promise<Response> {
  // Convert all files to base64
  const imagePromises = Array.from(files).map(async (file) => ({
    data: await fileToBase64(file),
    filename: file.name,
    mimeType: file.type,
    size: file.size
  }));

  const images = await Promise.all(imagePromises);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: images
    })
  });

  return response;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
