const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { parseStringPromise } = require('xml2js');
const { TikTokLiveConnection } = require('tiktok-live-connector');
const config = require('../config.json');

puppeteer.use(StealthPlugin());

let lastYouTubeVideoId = null;
let lastTikTokPostId = null;
let isTikTokLiveNotified = false;
let tikTokLiveConnection = null;

async function checkYouTube(client) {
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    try {
        const response = await axios.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${config.youtubeChannelId}`);
        const parsed = await parseStringPromise(response.data);
        const entries = parsed.feed.entry;

        if (!entries || entries.length === 0) return;

        const latest = entries[0];
        const videoId = latest['yt:videoId'][0];
        const title = latest.title[0];
        const link = latest.link[0].$.href;
        const author = latest.author[0].name[0];

        if (videoId !== lastYouTubeVideoId) {
            lastYouTubeVideoId = videoId;
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                channel.send(`🎥 **${author}** baru upload video!\n**${title}**\n${link}`);
            }
        }
    } catch (error) {
        console.error('Error checking YouTube:', error.message);
    }
}

async function checkTikTok(client) {
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true, 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ] 
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(`https://www.tiktok.com/@${config.tiktokUsername.replace('@', '')}`, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('div[data-e2e="user-post-item"]', { timeout: 20000 });
        const posts = await page.$$eval('div[data-e2e="user-post-item"] a', anchors => anchors.map(a => a.href));
        if (posts.length > 0) {
            const latestPost = posts[0];
            const postId = latestPost.split('/').pop();
            if (postId !== lastTikTokPostId) {
                lastTikTokPostId = postId;
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    channel.send(`🎵 **@${config.tiktokUsername.replace('@', '')}** baru upload TikTok!\n${latestPost}`);
                }
            }
        }
        await browser.close();
    } catch (error) {
        console.error('Error checking TikTok:', error.message);
        if (browser) await browser.close();
    }
}

async function checkTikTokLive(client) {
    if (tikTokLiveConnection) return;

    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    const username = config.tiktokUsername.replace('@', '');

    tikTokLiveConnection = new TikTokLiveConnection(`@${username}`);

    try {
        await tikTokLiveConnection.connect();

        if (!isTikTokLiveNotified) {
            isTikTokLiveNotified = true;
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                channel.send(`🔴 **@${username}** sedang LIVE di TikTok!\nhttps://www.tiktok.com/@${username}/live`);
            }
        }

        tikTokLiveConnection.on('streamEnd', () => {
            isTikTokLiveNotified = false;
            tikTokLiveConnection.disconnect();
            tikTokLiveConnection = null;
        });

    } catch (error) {
        tikTokLiveConnection = null;
        isTikTokLiveNotified = false;
    }
}

module.exports = {
    name: "clientReady",
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        setInterval(() => checkYouTube(client), 5 * 60 * 1000);
        setInterval(() => checkTikTok(client), 5 * 60 * 1000);
        setInterval(() => checkTikTokLive(client), 2 * 60 * 1000);
    }
}