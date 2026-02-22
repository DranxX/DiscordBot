# 🚀 Discord Bot

<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-14.0.0-blue?style=for-the-badge&logo=discord" alt="Discord.js"/>
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
- [x] **/ping** - Check bot latency and responsiveness
- [x] **/info** - Display server information in an embed
- [x] **/clear** - Bulk delete messages (1-100)

### 🛡️ Moderation Tools
- [x] **/ban** - Ban users with optional reason
- [x] **/kick** - Kick users with optional reason
- [x] **/timeout** - Timeout users for specified duration
- [x] **/untimeout** - Remove timeout from users
- [x] **/unban** - Unban users with optional reason

### 📺 Social Media Monitoring
- [x] **YouTube Notifier** - Real-time notifications for new videos
- [x] **TikTok Notifier** - Real-time notifications for new posts

### 🔧 Advanced Features
- [x] **Role-based Permissions** - Secure access control
- [x] **Ephemeral Responses** - Private command feedback
- [x] **Error Handling** - Robust error management
- [x] **Auto-deployment** - Automatic slash command registration

---

## 🛠️ Installation

### Prerequisites
- Node.js 16.0.0 or higher
- A Discord Bot Token
- YouTube Data API v3 Key (for YouTube notifications)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DranxX/DiscordBot.git
   cd DiscrodBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials:
     ```env
     TOKEN=your_discord_bot_token
     CLIENT_ID=your_application_id
     GUILD_ID=your_server_id
     YOUTUBE_API_KEY=your_youtube_api_key
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
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | For YouTube notifications |
| `NOTIFICATION_CHANNEL_ID` | Channel ID for notifications | For notifications |
| `MODERATOR_ROLE_ID` | Role ID for moderator permissions | ✅ |

### Config File (config.json)
```json
{
  "youtubeChannelId": "Channel ID for YouTube monitoring",
  "tiktokUsername": "TikTok username for monitoring"
}
```

---

## 📖 Usage

### Moderation Commands
All moderation commands require the specified moderator role and appropriate bot permissions.

#### Ban a User
```
/ban target:@user alasan:Reason for ban
```

#### Timeout a User
```
/timeout target:@user durasi:60 alasan:Spamming
```

### Social Media Monitoring
The bot automatically checks for new content every 5 minutes and sends notifications to the configured channel.

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

### User Permissions
- Commands use role-based access control
- Moderation commands require the configured moderator role

---

## 🚀 Deployment

### Local Development
```bash
npm run dev  # If you add a dev script
```

### Production
Use PM2 or similar process manager:
```bash
npm install -g pm2
pm2 start index.js --name "DiscrodBot"
```

---

## 🐛 Troubleshooting

### Common Issues
- **Commands not registering**: Check GUILD_ID and ensure bot has application.commands scope
- **YouTube API errors**: Verify API key and quota limits
- **TikTok scraping fails**: TikTok may have changed their structure; consider alternatives

### Debug Mode
Set `NODE_ENV=development` for verbose logging.

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
</div></content>