const axios = require('axios');
const puppeteer = require('puppeteer');
const config = require('../config.json');

let lastYouTubeVideoId = null;
let lastTikTokPostId = null;

async function checkYouTube(client) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${config.youtubeChannelId}&part=snippet,id&order=date&maxResults=5&type=video`);
        const items = response.data.items;
        if (items.length > 0) {
            const latest = items[0];
            if (latest.id.videoId !== lastYouTubeVideoId) {
                lastYouTubeVideoId = latest.id.videoId;
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    channel.send(`🎥 New YouTube video: **${latest.snippet.title}**\nhttps://www.youtube.com/watch?v=${latest.id.videoId}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking YouTube:', error.message);
    }
}

async function checkTikTok(client) {
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`https://www.tiktok.com/@${config.tiktokUsername.replace('@', '')}`, { waitUntil: 'networkidle2' });
        await page.waitForSelector('div[data-e2e="user-post-item"]', { timeout: 15000 });
        const posts = await page.$$eval('div[data-e2e="user-post-item"] a', anchors => anchors.map(a => a.href));
        if (posts.length > 0) {
            const latestPost = posts[0];
            const postId = latestPost.split('/').pop();
            if (postId !== lastTikTokPostId) {
                lastTikTokPostId = postId;
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    channel.send(`🎵 New TikTok post: ${latestPost}`);
                }
            }
        }
        await browser.close();
    } catch (error) {
        console.error('Error checking TikTok:', error.message);
    }
}

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        
        // Start pinger
        setInterval(() => checkYouTube(client), 5 * 60 * 1000); // Check every 5 minutes
        setInterval(() => checkTikTok(client), 5 * 60 * 1000);
    }
}
