# 🏀 Inside the NBA Schedule Calendar

Interactive calendar for the **Inside the NBA 2025-26 Season** on ESPN.

![Inside the NBA](https://img.shields.io/badge/Inside%20the%20NBA-ESPN-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 📅 **Interactive Calendar** - Navigate months, click dates to see episode details
- 🔗 **Subscribe to Calendar** - One-click subscribe, easy unsubscribe removes all events
- 📥 **Download .ics** - Download full season schedule for any calendar app
- 📅 **Add to Google Calendar** - Direct integration per episode
- 🍎 **Add to Apple Calendar** - Download single episode .ics
- ⏰ **Timezone Handling** - All times in Eastern Time (ET) with date-fns-tz
- 🎨 **Inside the NBA Branding** - Blue/red split design matching official logo

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
→ Opens at http://localhost:5173

### Production
```bash
npm run build
npm run preview
```

### Docker
```bash
docker compose up --build
```
→ Opens at http://localhost:5173

## 📅 Subscribe to Calendar

**Best option** - subscribe once, unsubscribe removes all events:

```
https://raw.githubusercontent.com/dwumfour-io/inside-the-nba/main/public/inside-the-nba.ics
```

**Google Calendar:** Settings → Add calendar → From URL → Paste

**Apple Calendar:** File → New Calendar Subscription → Paste

## 📺 Schedule

27 episodes from October 2025 to April 2026, every Saturday at **6:00 PM - 7:00 PM ET** on ESPN.

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **date-fns** + date-fns-tz - Timezone handling
- **Docker** - Containerized deployment

## 📜 License

MIT

---

Made with 🏀 for Inside the NBA fans
