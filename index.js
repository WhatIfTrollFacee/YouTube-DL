const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.get('/ytdl/dlaudio', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const format = audioFormats[0]; // Pilih format audio pertama yang tersedia

    const outputFileName = `audio-${Date.now()}.mp3`;
    const outputPath = path.resolve(__dirname, 'downloads', outputFileName);

    // Buat folder downloads jika belum ada
    if (!fs.existsSync(path.resolve(__dirname, 'downloads'))) {
      fs.mkdirSync(path.resolve(__dirname, 'downloads'));
    }

    const audioStream = ytdl(url, { format });
    const fileStream = fs.createWriteStream(outputPath);

    audioStream.pipe(fileStream);

    fileStream.on('finish', () => {
      res.json({ success: true, audio: `http://localhost:${port}/downloads/${outputFileName}` });
    });

    fileStream.on('error', (error) => {
      console.error('File Stream Error: ', error);
      res.status(500).json({ error: 'Failed to download audio' });
    });

  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error: 'Failed to process URL' });
  }
});

app.use('/downloads', express.static(path.resolve(__dirname, 'downloads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
