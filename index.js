const express = require("express");  // Import express sekali saja
const path = require("path");
const { exec } = require("child_process");

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Server nyala, bro!" });
});

app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL diperlukan" });
  }

  const ytDlpPath = path.join(__dirname, "yt-dlp.exe");

  exec(`"${ytDlpPath}" ${url}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Download gagal", details: error.message });
    }

    if (stderr) {
      return res.status(500).json({ error: "Error dari yt-dlp", details: stderr });
    }

    res.json({ status: "success", output: stdout });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
