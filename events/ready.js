const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { TikTokLiveConnection } = require('tiktok-live-connector');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const STATE_FILE = path.join(__dirname, '../notifier-state.json');

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch (e) { }
    return {};
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) { }
}

let state = loadState();
let lastYouTubeVideoId = state.lastYouTubeVideoId || null;
let lastTikTokPostId = state.lastTikTokPostId || null;
let uploadsPlaylistId = state.uploadsPlaylistId || null;
let lastKnownChannelId = state.lastKnownChannelId || null;
let isTikTokLiveNotified = false;
let isYouTubeLiveNotified = false;
let tikTokLiveConnection = null;

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
        }
    }
}

async function checkYouTube(client) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return;
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;

    if (lastKnownChannelId && lastKnownChannelId !== config.youtubeChannelId) {
        uploadsPlaylistId = null;
        lastYouTubeVideoId = null;
    }
    try {
        if (!uploadsPlaylistId) {
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${config.youtubeChannelId}&key=${apiKey}`;
            const chRes = await fetchWithRetry(channelUrl);
            const items = chRes.data.items;
            if (!items || !items.length) return;
            uploadsPlaylistId = items[0].contentDetails.relatedPlaylists.uploads;
            lastKnownChannelId = config.youtubeChannelId;
            saveState({ lastYouTubeVideoId, lastTikTokPostId, uploadsPlaylistId, lastKnownChannelId });
        }

        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`;
        const response = await fetchWithRetry(url);
        const items = response.data.items;
        if (!items || items.length === 0) return;

        let videos = items.map(item => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
            author: item.snippet.channelTitle || 'EnaxWorks™'
        })).filter(v => {
            const t = v.title.toLowerCase();
            return !t.includes('deleted') && !t.includes('private');
        });

        if (videos.length === 0) return;

        videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        const latest = videos[0];
        const videoId = latest.videoId;
        const title = latest.title;
        const author = latest.author;
        const link = `https://www.youtube.com/watch?v=${videoId}`;

        if (lastYouTubeVideoId === null || videoId !== lastYouTubeVideoId) {
            lastYouTubeVideoId = videoId;
            lastKnownChannelId = config.youtubeChannelId;
            saveState({ lastYouTubeVideoId, lastTikTokPostId, uploadsPlaylistId, lastKnownChannelId });
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) await channel.send(`🎥 **${author}** baru upload video!\n**${title}**\n${link}`);
        }
    } catch (error) { }
}

async function checkTikTok(client) {
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    const rawUsername = config.tiktokUsername.replace('@', '');
    const username = rawUsername.toLowerCase();

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1280,800'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto(`https://www.tiktok.com/@${username}`, { waitUntil: 'networkidle2', timeout: 60000 });

        try {
            await page.waitForSelector('a[href*="/video/"]', { timeout: 30000 });
        } catch (e) {
            await browser.close();
            return;
        }

        for (let i = 0; i < 4; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const latestData = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('[data-e2e="user-post-item"]'));
            if (cards.length === 0) return null;
            const first = cards[0];
            const linkEl = first.querySelector('a[href*="/video/"]');
            const captionEl = first.querySelector('[data-e2e="video-desc"]') || first.querySelector('span');
            return {
                href: linkEl ? linkEl.href.split('?')[0] : null,
                caption: captionEl ? captionEl.textContent.trim() : 'No caption'
            };
        });

        if (latestData && latestData.href) {
            const postId = latestData.href.split('/').pop();

            if (lastTikTokPostId === null || postId !== lastTikTokPostId) {
                lastTikTokPostId = postId;
                saveState({ lastYouTubeVideoId, lastTikTokPostId, uploadsPlaylistId, lastKnownChannelId });
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    await channel.send(`🎵 **@${rawUsername}** baru upload TikTok!\n**${latestData.caption}**\n${latestData.href}`);
                }
            } else {
            }
        } else {
        }
        await browser.close();
    } catch (error) {
        if (browser) await browser.close();
    }
}

async function checkYouTubeLive(client) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return;
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${config.youtubeChannelId}&eventType=live&type=video&key=${apiKey}`;
        const response = await fetchWithRetry(url);
        const items = response.data.items;

        if (items && items.length > 0) {
            const live = items[0];
            const title = live.snippet.title;
            const link = `https://www.youtube.com/watch?v=${live.id.videoId}`;
            const author = live.snippet.channelTitle;

            if (!isYouTubeLiveNotified) {
                isYouTubeLiveNotified = true;
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    await channel.send(`🔴 **${author}** sedang LIVE di YouTube!\n**${title}**\n${link}`);
                }
            }
        } else if (isYouTubeLiveNotified) {
            isYouTubeLiveNotified = false;
        }
    } catch (error) { }
}

async function checkTikTokLive(client) {
    if (tikTokLiveConnection) return;

    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    const rawUsername = config.tiktokUsername.replace('@', '');
    const username = rawUsername.toLowerCase();

    tikTokLiveConnection = new TikTokLiveConnection(`@${username}`);

    try {
        await tikTokLiveConnection.connect();

        if (!isTikTokLiveNotified) {
            isTikTokLiveNotified = true;
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                await channel.send(`🔴 **@${rawUsername}** sedang LIVE di TikTok!\nhttps://www.tiktok.com/@${username}/live`);
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
    async execute(client) {
        console.log(`[System] Logged in as ${client.user.tag}`);

        try {
            const guildId = process.env.GUILD_ID;
            const guild = await client.guilds.fetch(guildId);
            await guild.members.fetch();
            client.updatePresence(guild);

            checkYouTube(client);
            checkTikTok(client);
            checkYouTubeLive(client);
            checkTikTokLive(client);

            setInterval(() => checkYouTube(client), 30 * 1000);
            setInterval(() => checkTikTok(client), 30 * 1000);
            setInterval(() => checkYouTubeLive(client), 3 * 60 * 1000);
            setInterval(() => checkTikTokLive(client), 15 * 1000);

            console.log(`[System] Monitoring active.`);
        } catch (error) {
            console.error('[System] Ready Error:', error.message);
        }
    }
}