import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BACKEND_URL } from "@/const";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as stream from "stream";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export const VOICES_IDS = {
  oxley: {
    id: "gOkFV1JMCt0G0n9xmBwV",
    speed: 1.15,
  },
  jessica: {
    id: "g6xIsTj2HwM6VR4iXFCw",
    speed: 1,
  },
} as const

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

export const textToSpeech = async (text: string): Promise<stream.Readable> => {
  const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });
  const speech = await elevenlabs.textToSpeech.stream(VOICES_IDS.jessica.id, {
    text: text,
    modelId: "eleven_flash_v2_5",
    voiceSettings: {
      speed: VOICES_IDS.jessica.speed,
    }
  });
  return speech
}

export const speechToText = async (audioBlob: Blob): Promise<string> => {
  const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });
  const response = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v1",
    tagAudioEvents: true,
    languageCode: "eng",
    diarize: true,
  });
  return response.text
}
