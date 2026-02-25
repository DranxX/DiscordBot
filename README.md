# 🤖 DranxX Discord Bot

<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-14.16.3-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js"/>
  <img src="https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Version-1.2.0-orange?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status"/>
</div>

<div align="center">
  <h3>Discord bot for server moderation &amp; real-time social media notifications</h3>
  <p>Monitors YouTube and TikTok activity, and provides moderation tools with role-based access control and immune admin protection.</p>
</div>

---

## ✨ Features

### 🎯 General Commands
| Command | Description |
|---------|-------------|
| `/ping` | Check bot latency, API response time, and system info (CPU, RAM, Uptime) |
| `/info` | Display server information in a rich embed |

### 🛡️ Moderation Commands
> Requires `MODERATOR_ROLE_ID`. Users listed in `IMMUNE_ADMIN` cannot be targeted.

| Command | Description |
|---------|-------------|
| `/ban [target] [alasan]` | Ban a user from the server with an optional reason |
| `/kick [target] [alasan]` | Kick a user from the server with an optional reason |
| `/timeout [target] [durasi] [alasan]` | Timeout a user for 1–40320 minutes (up to 28 days) |
| `/untimeout [target]` | Remove timeout from a user |
| `/clear [jumlah]` | Bulk delete 1–100 messages in the current channel |

### 📺 Social Media Monitoring
| Feature | Description |
|---------|-------------|
| **YouTube Video Notifier** | Polls every 30s via YouTube Data API v3 for new video uploads |
| **YouTube Live Notifier** | Polls every 3 minutes and notifies when a channel goes LIVE on YouTube |
| **TikTok Post Notifier** | Scrapes TikTok profile every 30s for new posts using Puppeteer Stealth |
| **TikTok Live Notifier** | Connects via `tiktok-live-connector` and instantly notifies when a user goes LIVE |

### ⚙️ System Features
- **Real-time Presence** — Displays online/total member count in bot status, updated on presence changes and member join/leave events
- **Role-based Permissions** — All moderation commands require a designated moderator role
- **IMMUNE_ADMIN Protection** — A specified user ID cannot be banned, kicked, or timed out by anyone
- **Ephemeral Responses** — All moderation feedback is private (only visible to the executor)
- **Auto-deployment** — Slash commands are automatically registered to the guild on bot startup
- **Persistent State** — YouTube and TikTok notifier state is saved in `notifier-state.json` and survives restarts

---

## 🛠️ Installation

### Prerequisites
- Node.js `>= 16.0.0`
- A Discord Bot Token & Application
- YouTube Data API v3 Key (for YouTube monitoring)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/DranxX/Bot.git
   cd Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_application_id
   GUILD_ID=your_server_id
   NOTIFICATION_CHANNEL_ID=your_notification_channel_id
   MODERATOR_ROLE_ID=your_moderator_role_id

   IMMUNE_ADMIN=user_id_that_cannot_be_moderated

   YOUTUBE_API_KEY=your_youtube_data_api_v3_key
   ```

4. **Configure social media targets**

   Edit `config.json`:
   ```json
   {
     "youtubeChannelId": "UCxxxxxxxxxxxxxxxxxxxxxx",
     "tiktokUsername": "@your_tiktok_username"
   }
   ```

5. **Run the bot**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration Reference

### Environment Variables (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `TOKEN` | Discord bot token | ✅ |
| `CLIENT_ID` | Discord application (client) ID | ✅ |
| `GUILD_ID` | Server ID for command registration & presence | ✅ |
| `NOTIFICATION_CHANNEL_ID` | Channel ID where notifications are sent | ✅ |
| `MODERATOR_ROLE_ID` | Role ID required to use moderation commands | ✅ |
| `IMMUNE_ADMIN` | User ID that is immune to kick, ban, and timeout | ✅ |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key for video & live monitoring | ✅ |

### Config File (`config.json`)
| Key | Description |
|-----|-------------|
| `youtubeChannelId` | YouTube channel ID to monitor (e.g. `UCxxxxxx`) |
| `tiktokUsername` | TikTok username to monitor (including `@`) |

---

## 🔒 Required Bot Permissions

### Discord Permissions
- Send Messages
- Use Slash Commands
- Ban Members
- Kick Members
- Moderate Members (Timeout)
- Manage Messages
- View Channels
- Read Message History

### Required Gateway Intents
- `Guilds`
- `GuildMessages`
- `MessageContent`
- `GuildMembers`
- `GuildPresences`

---

## 🚀 Deployment

### Using PM2 (recommended for 24/7 uptime)
```bash
npm install -g pm2
pm2 start index.js --name "DranxX-Bot"
pm2 save
pm2 startup
```

### Using Node.js built-in watch (development)
```bash
npm run dev
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Built with Love"/>
  <img src="https://forthebadge.com/images/badges/made-with-javascript.svg" alt="Made with JavaScript"/>
</div>