const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");  // Import fs untuk file system
const ytdl = require("youtube-dl-exec");  // Pake youtube-dl-exec

const app = express();

app.use(express.json());

// Endpoint untuk cek server
app.get("/api/test", (req, res) => {
  res.json({ message: "Server nyala, bro!" });
});

// Endpoint untuk download video TikTok
app.post("/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL diperlukan" });
  }

  try {
    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!data || !data.data || !data.data.play) {
      return res.status(400).json({ error: "Gagal menemukan link video." });
    }

    return res.json({
      status: "success",
      video_url: data.data.play,
      cover: data.data.cover,
    });
  } catch (err) {
    console.error("ERR:", err.message);
    return res.status(500).json({
      error: "Terjadi kesalahan pada server",
      detail: err.message,
    });
  }
});

// Endpoint untuk download MP3 TikTok
app.post("/download_mp3", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL diperlukan" });
  }

  try {
    const filePath = await downloadMp3(url);
    res.download(filePath);  // Kirim file MP3 ke user
  } catch (err) {
    console.error("ERR:", err.message);
    return res.status(500).json({
      error: "Terjadi kesalahan pada server saat mendownload MP3",
      detail: err.message,
    });
  }
});

// Fungsi untuk download MP3 menggunakan youtube-dl-exec
async function downloadMp3(url) {
  return new Promise((resolve, reject) => {
    const ydl_opts = {
      format: "bestaudio/best",
      postprocessors: [{
        key: "FFmpegAudioConvertor",
        preferredcodec: "mp3",
        preferredquality: "192",
      }],
      outtmpl: path.join(__dirname, "downloads", "output.%(ext)s"),  // Pastikan pathnya benar
    };

    // Pastikan folder downloads ada
    const downloadFolder = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder); // Buat folder downloads kalau belum ada
    }

    ytdl(url, ydl_opts) // Pake youtube-dl-exec
      .then(() => {
        resolve(path.join(downloadFolder, "output.mp3"));  // Kembalikan path file MP3
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// Nyalakan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
