import dotenv from 'dotenv';
import path from 'path';
import { ElevenLabsClient, stream as streamEleven } from "@elevenlabs/elevenlabs-js";
import { VOICES_IDS } from './voices';
import * as stream from "stream";

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

console.log('Environment variables loaded:');

const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

export const textToSpeech = async (text: string): Promise<stream.Readable> => {
    const speech = await elevenlabs.textToSpeech.stream(VOICES_IDS.oxley.id, {
        text: text,
        modelId: "eleven_flash_v2_5",
        voiceSettings: {
            speed: VOICES_IDS.oxley.speed,
        }
    });
    return speech
}

export const speechToText = async (audioBlob: Blob): Promise<string> => {
    const response = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1",
        tagAudioEvents: true,
        languageCode: "eng",
        diarize: true,
    });
    return response.text
}

export const testSpeechToText = async () => {
    const response = await fetch(
        "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
    );
    const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
    const transcription = await speechToText(audioBlob)
    console.log(transcription);
}

// ⚠️ elevenlabs-js requires MPV and ffmpeg to play audio.
async function testTextToSpeech() {
    const text = "With a soft and whispery American accent, I'm the ideal choice for creating ASMR content, meditative guides, or adding an intimate feel to your narrative projects."
    const speechStream = await textToSpeech(text)
    streamEleven(speechStream)
}

testSpeechToText().catch(console.error);
