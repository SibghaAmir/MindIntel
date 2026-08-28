const https = require('https');
const fs = require('fs');
const path = require('path');

const sounds = [
  { url: 'https://cdn.freesound.org/previews/513/513289_11200508-lq.mp3', file: 'blip.mp3' }, // small UI click
  { url: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', file: 'success.mp3' }, // success chime
  { url: 'https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3', file: 'thinking.mp3' } // scan hum
];

const destDir = path.join(__dirname, 'assets', 'sounds');

sounds.forEach((sound) => {
  const destPath = path.join(destDir, sound.file);
  const file = fs.createWriteStream(destPath);
  https.get(sound.url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${sound.file}`);
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error(`Error downloading ${sound.file}:`, err.message);
  });
});
