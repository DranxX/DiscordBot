# 🚀 Discord Bot

<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-14.16.3-blue?style=for-the-badge&logo=discord" alt="Discord.js"/>
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status"/>
</div>

<div align="center">
  <h2>🤖 Discord Bot with Moderation & Social Media Monitoring</h2>
  <p>Simple Discord bot designed for server management, moderation, and real-time notifications from YouTube and TikTok.</p>
</div>

---

## ✨ Features

### 🎯 Core Commands
- [x] **/ping** - Check bot latency, API response, and system info (CPU, RAM, Uptime)
- [x] **/info** - Display server information in a rich embed
- [x] **/clear** - Bulk delete messages (up to 1000 messages)

### 🛡️ Moderation Tools
- [x] **/ban** - Ban users with optional reason
- [x] **/kick** - Kick users with optional reason
- [x] **/timeout** - Timeout users for specified duration (up to 28 days)
- [x] **/untimeout** - Remove timeout from users

### 📺 Social Media Monitoring
- [x] **YouTube Notifier** - Real-time notifications for new videos via RSS (No API Key required)
- [x] **TikTok Notifier** - Real-time notifications for new posts (Scraping-based)
- [x] **TikTok Live Notifier** - Instant notifications when a user goes LIVE on TikTok

### 🔧 Advanced Features
- [x] **Real-time Presence** - Displays online members count in bot status
- [x] **Role-based Permissions** - Secure access control for moderator commands
- [x] **Ephemeral Responses** - Private command feedback for moderation actions
- [x] **Auto-deployment** - Automatic slash command registration on startup

---

## 🛠️ Installation

### Prerequisites
- Node.js 16.0.0 or higher
- A Discord Bot Token
- Appropriate permissions for the bot in your server

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DranxX/DiscordBot.git
   cd DiscordBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Fill in your credentials:
     ```env
     TOKEN=your_discord_bot_token
     CLIENT_ID=your_application_id
     GUILD_ID=your_server_id
     NOTIFICATION_CHANNEL_ID=your_channel_id
     MODERATOR_ROLE_ID=your_moderator_role_id
     ```

4. **Configure social media**
   - Edit `config.json`:
     ```json
     {
       "youtubeChannelId": "UC_YOUR_CHANNEL_ID",
       "tiktokUsername": "@your_tiktok_username"
     }
     ```

5. **Run the bot**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration

### Environment Variables (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `TOKEN` | Discord bot token | ✅ |
| `CLIENT_ID` | Discord application ID | ✅ |
| `GUILD_ID` | Server ID for command registration | ✅ |
| `NOTIFICATION_CHANNEL_ID` | Channel ID for social media notifications | ✅ |
| `MODERATOR_ROLE_ID` | Role ID allowed to use moderator commands | ✅ |

### Config File (config.json)
```json
{
  "youtubeChannelId": "Channel ID for YouTube monitoring",
  "tiktokUsername": "TikTok username (including @) for monitoring"
}
```

---

## 🔒 Permissions Required

### Bot Permissions
- Send Messages
- Use Slash Commands
- Ban Members
- Kick Members
- Moderate Members
- Manage Messages
- View Channels
- Guild Presences (Intents)
- Guild Members (Intents)

---

## 🚀 Deployment

### Production
Use PM2 or similar process manager for 24/7 uptime:
```bash
npm install -g pm2
pm2 start index.js --name "DiscordBot"
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Built with Love"/>
  <img src="https://forthebadge.com/images/badges/made-with-javascript.svg" alt="Made with JavaScript"/>
</div>