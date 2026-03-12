# VoiceBrain AI — Command & Dispatch Demo

Scroll-triggered animated use-case demo with real Mapbox dark map, radiating connection lines, and bold incident callouts.

## Quick Start (Local)

```bash
# 1. Clone and install
git clone https://github.com/departuredesign/voicebrain.git
cd voicebrain
npm install

# 2. Get a Mapbox token (free tier works)
#    → https://account.mapbox.com/access-tokens/
#    Copy the default public token

# 3. Create .env file
cp .env.example .env
# Edit .env and paste your token:
#   VITE_MAPBOX_TOKEN=pk.eyJ1Ijoiyo...

# 4. Run
npm run dev
# Opens at http://localhost:5173
```

## Deploy to GitHub + Vercel

### Step 1: Push to GitHub

```bash
# In the project directory
git init
git add .
git commit -m "VoiceBrain dispatch demo"

# Create repo on GitHub (via github.com/new or gh CLI)
# The repo already exists at: https://github.com/departuredesign/voicebrain

git remote add origin https://github.com/departuredesign/voicebrain.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `voicebrain` repository
4. Vercel auto-detects Vite — leave framework preset as **Vite**
5. **Critical:** Add the environment variable before deploying:
   - Click **"Environment Variables"**
   - Add: `VITE_MAPBOX_TOKEN` = `pk.eyJ1Ijoiyo...` (your Mapbox token)
6. Click **Deploy**

Your demo will be live at `https://voicebrain-demo.vercel.app` (or your custom domain).

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add `demo.voicebrain.ai` (or whatever you want)
3. Add the DNS records Vercel gives you to your domain registrar

## Mapbox Setup

1. Create a free account at [mapbox.com](https://www.mapbox.com/)
2. Go to [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy the **Default public token** (starts with `pk.`)
4. The free tier includes **50,000 map loads/month** — more than enough for a demo

### Restricting your token (recommended for production)

In the Mapbox dashboard, edit your token to restrict it:
- **URL restrictions**: Add your Vercel domain (e.g., `https://voicebrain-demo.vercel.app/*`)
- This prevents others from using your token

## Project Structure

```
voicebrain-demo/
├── index.html          # Entry point (loads Mapbox GL CSS)
├── package.json        # Dependencies: react, mapbox-gl
├── vite.config.js      # Vite + React plugin
├── .env.example        # Template for Mapbox token
├── .gitignore          # Excludes node_modules, .env, dist
└── src/
    ├── main.jsx        # React mount
    └── App.jsx         # Full demo component
```

## How It Works

- **Scroll/wheel** drives navigation through 8 steps
- **Mapbox GL** renders a real SF dark map (`dark-v11` style)
- Each step calls `map.flyTo()` with specific center, zoom, bearing, and pitch
- **Sensor markers** are Mapbox `Marker` elements positioned at real lat/lng
- **Connection lines** are SVG overlays that project lat/lng → screen pixels
- **Callout overlays** (incident pill, KODI alert, etc.) reposition on every map move
- **TOC sidebar** stays fixed and highlights the active step

## Customization

- **Change location**: Edit `MAP_CENTER` and sensor `lng/lat` values in `App.jsx`
- **Change map style**: Replace `dark-v11` with `satellite-streets-v12`, `navigation-night-v1`, etc.
- **Add steps**: Add entries to the `STEPS` array with new fly-to params and sensor activations
- **Add sensors**: Add entries to `SENSORS` with type, lng, lat
