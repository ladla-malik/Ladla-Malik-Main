module.exports = async (conn, mek, m, { from, args, reply }) => {
    const yts = require("yt-search");
    const axios = require("axios");

    const configUrl = 'https://raw.githubusercontent.com/username/repo/main/config.json'; // GitHub config URL
    const configRes = await axios.get(configUrl);
    const { api_url, api_key } = configRes.data;

    if (!api_url || !api_key) {
        return reply("❌ Failed to load API configuration.");
    }

    const query = args.join(" "); // Combine all arguments into a search query
    if (!query) return reply("*Please provide a video title or URL*");

    reply("*🎬 Downloading video from YouTube...*");

    const searchResult = await yts(query);
    if (!searchResult.videos || searchResult.videos.length === 0) {
        return reply(`❌ No results found for "${query}".`);
    }

    const video = searchResult.videos[0];
    const videoUrl = video.url;

    const downloadUrl = `${api_url}/download/dlmp4?apikey=${api_key}&url=${videoUrl}`;
    const videoRes = await axios.get(downloadUrl);

    if (!videoRes.data.success) return reply(`❌ Failed to fetch video for "${query}".`);

    const { download_url } = videoRes.data.result;

    await conn.sendMessage(
        from,
        { video: { url: download_url }, mimetype: 'video/mp4' },
        { quoted: mek }
    );
};
