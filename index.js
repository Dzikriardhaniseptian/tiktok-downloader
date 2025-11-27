const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const yt_dlp = require("yt-dlp");  // Import yt-dlp untuk download MP3

const app = express();

// biar server bisa baca JSON dari frontend
app.use(express.json());

// biar file di folder "public" bisa diakses lewat browser
app.use(express.static(path.join(__dirname, "public")));

// 🔹 endpoint test (cek server nyala)
app.get("/api/test", (req, res) => {
  res.json({ message: "Server nyala, bro!" });
});

// 🔹 endpoint utama: download video TikTok
app.post("/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url required" });
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

// 🔹 endpoint untuk download MP3 TikTok
app.post("/download_mp3", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url required" });
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

// Fungsi untuk download MP3 menggunakan yt-dlp
async function downloadMp3(url) {
  return new Promise((resolve, reject) => {
    const ydl_opts = {
      format: "bestaudio/best",
      postprocessors: [{
        key: "FFmpegAudioConvertor",
        preferredcodec: "mp3",
        preferredquality: "192",
      }],
      outtmpl: "downloads/output.%(ext)s",  // Tempat nyimpen file
    };

    const ydl = new yt_dlp.YoutubeDL(ydl_opts);
    ydl.download([url]);

    ydl.on("end", () => {
      resolve("downloads/output.mp3");  // Kembalikan path file MP3
    });

    ydl.on("error", (err) => {
      reject(err);
    });
  });
}

// 🔹 nyalakan server (siap untuk localhost & Replit)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
