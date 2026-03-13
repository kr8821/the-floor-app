# THE FLOOR - Youth Group Edition

A game show app based on FOX's "The Floor" designed for church youth group.

## Quick Deploy to Vercel (Free)

### Step 1: Push to GitHub
1. Create a new repository on GitHub (e.g., `the-floor-game`)
2. Unzip this project folder
3. In your terminal:
   ```
   cd the-floor-youth-group
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/the-floor-game.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `the-floor-game` repository
4. Vercel auto-detects Vite - just click "Deploy"
5. Done! You get a URL like `the-floor-game.vercel.app`

### Step 3: Use at Youth Group
1. Open the URL on your laptop
2. Click "Open Player Display Window" to pop out the projector view
3. Drag that window to your projector/TV screen
4. Control the game from your laptop screen

## How It Works

- **Setup**: Add players with names and categories (pick from 20+ pre-loaded categories or type custom ones)
- **Prep**: Pre-loaded categories come with 15+ clues already. You can also upload images or generate more AI clues.
- **Play**: Randomizer picks a player, they choose an adjacent opponent, 5-second countdown, then the duel begins!
- **Duel**: Clues show on the player display (no answers). Host screen shows answers. Hit CORRECT to switch clocks, PASS to dock 3 seconds.
- **Win**: Last player standing conquers the entire floor!

## Pre-loaded Categories (15+ clues each)
Animals, Bible Characters, Worship Songs, Movies, Countries, Food & Drinks, Sports, Video Games, Books of the Bible, Flags, Dinosaurs, Candy & Snacks, Space, Dog Breeds, Famous Landmarks, Instruments, Holidays, Superheroes, Cartoons, Science

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173
