import dotenv from 'dotenv';
import path from 'path';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Now you can access environment variables
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Example usage
console.log('Environment variables loaded:');
console.log('MISTRAL_API_KEY:', MISTRAL_API_KEY ? '***' : 'Not set');
console.log('ELEVENLABS_API_KEY:', ELEVENLABS_API_KEY ? '***' : 'Not set');

async function main() {
    const elevenlabs = new ElevenLabsClient({
        apiKey: ELEVENLABS_API_KEY, // Uses the loaded environment variable
    });

    const voices = await elevenlabs.voices.search();

    console.log(voices);
}

main().catch(console.error);
