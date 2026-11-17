# 🎈 Bolo! - Child Words & Pronunciation Learning App

**Bolo!** is a simple, child-friendly learning web application designed for early childhood vocabulary and pronunciation.

---

## 🌟 How It Works

1. **First Page**:
   - Welcoming hero image banner on top.
   - Clean list of categories:
     - 🦁 **Animals**
     - 🌸 **Flowers**
     - 🌿 **Plants & Trees**
     - 👁️ **Body Parts**
     - 🧘 **Sitting Positions**

2. **Category Flashcard Page**:
   - **🎲 Random on Entry**: Clicking a category opens a random item from that category.
   - **🎲 Random Next**: Clicking **"Random Next"** quietly loads another random item from the category (without speaking automatically).
   - **🔊 Speak on Click Only**: When the child taps the **picture** or clicks **"Sound 🔊"**, the app pronounces that word clearly!

---

## 🖼️ Authentic Isolated Images & How to Customize

All images for Body Parts, Sitting Positions, Flowers, and Plants are isolated subjects (zero background clutter) stored locally in:

```
public/images/
├── body-parts/         (eye.svg, ear.svg, nose.svg, mouth.svg, hands.svg, feet.svg, teeth.svg)
├── sitting-position/   (cross-legged.svg, lotus-pose.svg, kneeling.svg, chair-sitting.svg, butterfly.svg, squatting.svg)
├── flower/             (rose.svg, sunflower.svg, lotus.svg, tulip.svg, daisy.svg, etc.)
└── plant/              (oak-tree.svg, pine-tree.svg, coconut-palm.svg, cactus.svg, bamboo.svg, etc.)
```

### How to use your own photos / flashcards:
1. Drop your photo (e.g. `my_eye.jpg` or `real_rose.png`) into `public/images/body-parts/` or any folder under `public/images/`.
2. Open `src/data/categories.js` and update the `image` field:
   ```javascript
   {
     id: "eye",
     name: "Eye",
     image: "/images/body-parts/my_eye.jpg"
   }
   ```
3. Run `npm run build`.

### Best Free Authentic Sources for Isolated Subject Images:
- **Openverse** (https://openverse.org): Search e.g. `"eye"` and filter by public domain / isolated.
- **Wikimedia Commons**: Search for transparent PNGs or SVGs of anatomical body parts and botanical specimens.
- **Flaticon / Freepik**: Free educational vector flashcard packs designed specifically for preschool learning.

---

## 🚀 Running Locally

```bash
# 1. Start development server
npm run dev

# 2. Or view production build
npm run preview
```

Open `http://localhost:5173/` (or `http://localhost:4173/`) in your browser.
