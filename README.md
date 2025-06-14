
# AstroExplorer Dashboard

AstroExplorer Dashboard is a modern, responsive dashboard for astronomy and science lovers featuring live NASA images, planetary maps, natural events, live crypto prices, and a daily mood journal.

---

## ✨ Features

- NASA Astronomy Picture of the Day
- EPIC Earth imagery browser
- Interactive NASA planetary maps (Moon, Mars, Vesta)
- Live BTC/ETH pricing with auto-refresh
- NASA EONET event mapping
- Mood & Reflection daily journal (local storage)
- Responsive 2-column grid UI, dark theme by default

---

## 🛠️ Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Provide API keys

Copy `.env.local.example` to `.env.local`:

```sh
cp .env.local.example .env.local
```

Edit `.env.local` and provide your [NASA API Key](https://api.nasa.gov/):

```
NASA_API_KEY=your_nasa_api_key_here
```

### 3. Run locally

```sh
npm run dev
```

### 4. Build for production

```sh
npm run build && npm start
```

---

## 🚀 Deploy

Ready for one-click deploy to [Vercel](https://vercel.com/):

- Deploy button:  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project)

---

### Environment Variables

- `NASA_API_KEY` – required for APOD/EPIC/WMTS data

---

### Attribution

- NASA Open APIs, NASA EPIC, EONET, CoinGecko API
- Design by AstroExplorer Project

