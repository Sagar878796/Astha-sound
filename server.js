const express = require("express");
const { spawn } = require("child_process");
const axios = require("axios");

const app = express();

// 🔥 Default M3U URL
const M3U_URL = "https://iptv-org.github.io/iptv/index.m3u";

// Home
app.get("/", (req, res) => {
    res.send("IPTV M3U Server Running ✅");
});

// 🔥 Get full M3U playlist
app.get("/playlist", async (req, res) => {
    try {
        const response = await axios.get(M3U_URL);
        res.setHeader("Content-Type", "text/plain");
        res.send(response.data);
    } catch (err) {
        res.send("Failed to load playlist");
    }
});

// 🔥 Play stream
app.get("/play", (req, res) => {
    const input = req.query.url;

    if (!input) return res.send("Missing stream URL");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    const ffmpeg = spawn("ffmpeg", [
        "-re",
        "-i", input,

        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ac", "2",
        "-ar", "44100",

        "-f", "hls",
        "-hls_time", "6",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments",

        "pipe:1"
    ]);

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on("data", (d) => {
        console.log(d.toString());
    });

    ffmpeg.on("close", () => res.end());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
