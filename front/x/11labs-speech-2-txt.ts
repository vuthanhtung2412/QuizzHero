import dotenv from 'dotenv';
import path from 'path';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
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

export const textToSpeech = async (speech: string): Promise<stream.Readable> => {
    const audio = await elevenlabs.textToSpeech.stream(VOICES_IDS.oxley, {
        text: speech,
        modelId: "eleven_multilingual_v2",
    });
    return audio
}
