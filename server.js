const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.get("/", (req, res) => {
    res.send("Audio Fix Server Running ✅");
});

app.get("/play", (req, res) => {
    const input = req.query.url;

    if (!input) return res.send("Missing URL");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    const ffmpeg = spawn("ffmpeg", [
        "-re",
        "-i", input,

        "-c:v", "copy",

        // 🔊 AUDIO FIX
        "-c:a", "aac",
        "-b:a", "128k",
        "-ac", "2",
        "-ar", "44100",

        "-preset", "veryfast",
        "-tune", "zerolatency",

        "-f", "hls",
        "-hls_time", "6",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments",

        "pipe:1"
    ]);

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on("data", (data) => {
        console.log(data.toString());
    });

    ffmpeg.on("close", () => {
        res.end();
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
