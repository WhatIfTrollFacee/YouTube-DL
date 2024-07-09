
const express = require('express');
const ytdl = require('ytdl-core');
const { createServer } = require('http');

const app = express();

app.get('/api/ytdl/dlaudio', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const format = audioFormats[0]; // Pilih format audio pertama yang tersedia

    res.setHeader('Content-Disposition', `attachment; filename="audio.mp3"`);
    ytdl(url, { format }).pipe(res);

  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error: 'Failed to process URL' });
  }
});

const server = createServer(app);

module.exports = (req, res) => {
  server.emit('request', req, res);
};
