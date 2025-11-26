// index.js
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

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

// 🔹 nyalakan server (siap untuk localhost & Replit)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
