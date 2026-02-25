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
    } catch (e) {}
    return {};
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {}
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
        console.log(`[YouTube API] Channel ID changed, resetting...`);
        uploadsPlaylistId = null;
        lastYouTubeVideoId = null;
    }

    console.log('[YouTube API] Checking for new videos...');
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
    } catch (error) {
        console.error('[YouTube API] Error:', error.message);
    }
}

async function checkTikTok(client) {
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    const rawUsername = config.tiktokUsername.replace('@', '');
    const username = rawUsername.toLowerCase();
    console.log(`[TikTok] Checking for new posts for @${rawUsername}...`);
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
            console.log('[TikTok] No video links found after waiting.');
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
            console.log(`[TikTok] Latest post: ${latestData.href} | Caption: ${latestData.caption}`);
            const postId = latestData.href.split('/').pop();

            if (lastTikTokPostId === null || postId !== lastTikTokPostId) {
                lastTikTokPostId = postId;
                saveState({ lastYouTubeVideoId, lastTikTokPostId, uploadsPlaylistId, lastKnownChannelId });
                const channel = client.channels.cache.get(notificationChannelId);
                if (channel) {
                    await channel.send(`🎵 **@${rawUsername}** baru upload TikTok!\n**${latestData.caption}**\n${latestData.href}`);
                    console.log('[TikTok] Notification sent with caption.');
                }
            } else {
                console.log('[TikTok] No new posts.');
            }
        } else {
            console.log('[TikTok] No video posts found.');
        }
        await browser.close();
    } catch (error) {
        console.error('[TikTok] Error:', error.message);
        if (browser) await browser.close();
    }
}

async function checkYouTubeLive(client) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return;
    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    console.log('[YouTube Live] Checking...');
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
                    console.log('[YouTube Live] Notification sent.');
                }
            }
        } else if (isYouTubeLiveNotified) {
            isYouTubeLiveNotified = false;
        }
    } catch (error) {
        console.error('[YouTube Live] Error:', error.message);
    }
}

async function checkTikTokLive(client) {
    if (tikTokLiveConnection) return;

    const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
    const rawUsername = config.tiktokUsername.replace('@', '');
    const username = rawUsername.toLowerCase();
    console.log(`[TikTok Live] Checking @${rawUsername}...`);

    tikTokLiveConnection = new TikTokLiveConnection(`@${username}`);

    try {
        await tikTokLiveConnection.connect();
        console.log(`[TikTok Live] Connected to @${username}.`);

        if (!isTikTokLiveNotified) {
            isTikTokLiveNotified = true;
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                await channel.send(`🔴 **@${rawUsername}** sedang LIVE di TikTok!\nhttps://www.tiktok.com/@${username}/live`);
            }
        }

        tikTokLiveConnection.on('streamEnd', () => {
            console.log(`[TikTok Live] LIVE ended.`);
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