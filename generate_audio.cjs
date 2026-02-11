const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Minimal 8-bit mono 8kHz WAV file with 0.1s of noise/beep
// Header: RIFF (4) size (4) WAVE (4) fmt (4) size (4) format (2) channels (2) rate (4) bytes/sec (4) block (2) bits (2) data (4) size (4)
const generateWav = (filename, frequency = 440) => {
    const duration = 0.1;
    const sampleRate = 8000;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(44 + numSamples);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples, 4);
    buffer.write('WAVE', 8);

    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate, 28);
    buffer.writeUInt16LE(1, 32);
    buffer.writeUInt16LE(8, 34);

    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples, 40);

    for (let i = 0; i < numSamples; i++) {
        // Generate a simple square wave or sine wave
        const val = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        buffer.writeUInt8(Math.floor((val + 1) * 127), 44 + i);
    }

    fs.writeFileSync(path.join(audioDir, filename), buffer);
    console.log(`Generated ${filename}`);
};

generateWav('click.wav', 880);
generateWav('card_flip.wav', 440);
generateWav('whistle.wav', 1200);
generateWav('cheer.wav', 300);
generateWav('goal.wav', 600);
