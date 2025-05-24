import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BACKEND_URL } from "@/const"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function sendPhotos(session_id: number, files: File[]): Promise<Response> {
  const url = `${BACKEND_URL}/session/${session_id}/docs`
  
  const images = await Promise.all(
    files.map(async (file) => ({
      image: await fileToBase64(file),
      filename: file.name,
      mimeType: file.type
    }))
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(images)
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

