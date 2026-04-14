const express = require("express");
const axios = require("axios");
const { spawn } = require("child_process");

const app = express();

// ================= HOME =================
app.get("/", (req, res) => {
    res.send("🔥 IPTV FULL M3U FIX SERVER RUNNING");
});


// ================= M3U LIST =================
app.get("/list", async (req, res) => {
    try {
        const m3uUrl = "https://iptv-org.github.io/iptv/index.m3u";

        const response = await axios.get(m3uUrl);
        const lines = response.data.split("\n");

        let result = "#EXTM3U\n";

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith("#EXTINF")) {
                const url = lines[i + 1];

                if (url && url.startsWith("http")) {
                    result += line + "\n";
                    result += `https://astha-sound.onrender.com/?url=${encodeURIComponent(url)}\n`;
                    i++;
                }
            }
        }

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(result);

    } catch (err) {
        res.send("M3U load error");
    }
});


// ================= STREAM FIX =================
app.get("/play", (req, res) => {
    const input = req.query.url;
    if (!input) return res.send("Missing URL");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ffmpeg = spawn("ffmpeg", [
        "-re",
        "-i", input,

        // VIDEO FIX
        "-c:v", "copy",

        // AUDIO FIX 🔥
        "-c:a", "aac",
        "-b:a", "128k",
        "-ac", "2",

        // STABILITY
        "-fflags", "+genpts+nobuffer",
        "-avoid_negative_ts", "make_zero",

        // HLS OUTPUT
        "-f", "hls",
        "-hls_time", "4",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments+append_list+independent_segments",

        "pipe:1"
    ]);

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on("data", d => {
        console.log("FFMPEG:", d.toString());
    });

    req.on("close", () => ffmpeg.kill("SIGKILL"));
});


// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 SERVER RUNNING ON PORT", PORT);
});
