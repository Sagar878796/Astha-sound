const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = 3000;

// 🔗 Input IPTV
const SOURCE = "https://iptv-org.github.io/iptv/index.m3u";

// 📂 Output
const OUTPUT = "public/output.m3u8";

app.use(express.static("public"));

// 🔥 Run FFmpeg every 5 minutes
setInterval(() => {
    console.log("Running FFmpeg...");

    const cmd = `
    ffmpeg -y -i "${SOURCE}" \
    -c:v copy \
    -c:a aac -b:a 128k \
    -f hls \
    -hls_time 10 \
    -hls_list_size 5 \
    -hls_flags delete_segments \
    public/output.m3u8
    `;

    exec(cmd, (err) => {
        if (err) console.log("FFmpeg error:", err);
        else console.log("Stream updated!");
    });

}, 300000); // 5 min

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
