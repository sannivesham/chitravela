# Chitravela

A free multiplayer draw-and-guess party game for you and your friends —
built to specifically avoid the "disconnected" problem: there's no game
server that can sleep, crash, or drop a connection. Every player's browser
talks straight to Firestore (Google's real-time database), so opening the
link just... works.

- **Frontend:** React + Vite, hosted free on GitHub Pages
- **Backend:** Firebase (Firestore for game state, Firebase Auth for the
  word-management dashboard)
- **No server to run or pay for.**

---

## 1. Create your Firebase project

You said you already have a Firebase project — good, skip to step 1b if so.
Otherwise:

1. Go to https://console.firebase.google.com → **Add project** → name it
   anything (e.g. `chitravela`) → you can turn off Google Analytics, it's
   not needed.

### 1a. Register a web app

In your Firebase project → gear icon → **Project settings** → scroll to
"Your apps" → click the **</>** (web) icon → nickname it `chitravela-web`
→ **do not** check "also set up Firebase Hosting" (GitHub Pages is doing
that job). You'll be shown a `firebaseConfig` object — keep this tab open,
you'll need six values from it in step 4.

### 1b. Turn on Firestore

Left sidebar → **Build → Firestore Database** → **Create database** →
start in **production mode** → pick any region close to you and your
friends.

### 1c. Turn on Authentication

Left sidebar → **Build → Authentication** → **Get started**. Under the
"Sign-in method" tab, enable two providers:

- **Anonymous** — this is what silently signs each *player* in the moment
  they open the site, no login screen for them at all.
- **Email/Password** — this is only used by *you* to log into `/admin`.

### 1d. Apply the security rules

Firestore Database → **Rules** tab → replace the contents with the file
`firestore.rules` from this repo → **Publish**.

These rules are what actually keep the secret word hidden from guessers
(only the current drawer's browser is allowed to read it) and make sure
only you can edit the word list — not just convention, enforced by
Firebase itself.

---

## 2. Make yourself an admin

1. Run the app locally first (step 4 below), or just deploy it and open
   `/#/admin` on the live site.
2. Click **"First time? Create an admin account"**, sign up with an email
   + password of your choice.
3. You'll land on a screen that says "Almost there" and shows your UID
   with a copy button. Copy it.
4. In the Firebase console → Firestore Database → **Start collection** →
   collection ID: `admins` → document ID: *paste your UID* → add any
   field, e.g. `allowed` (boolean) = `true` → **Save**.
5. Reload `/#/admin` — you're in.

Repeat step 4 (with a different UID) for anyone else you want able to
manage words. Regular players never see this screen — they never log in
at all, they just type a name and play.

---

## 3. Push this code to GitHub

```bash
cd chitravela
git init
git add .
git commit -m "Chitravela"
git branch -M main
git remote add origin https://github.com/<your-username>/chitravela.git
git push -u origin main
```

If you name the repo something other than `chitravela`, open
`vite.config.js` and change `base: '/chitravela/'` to match — this is
required for GitHub Pages to load your CSS/JS correctly.

---

## 4. Local development (optional, but useful for testing)

```bash
cd chitravela
cp .env.example .env
```

Open `.env` and fill in the six `VITE_FIREBASE_...` values from step 1a's
`firebaseConfig` object (they map directly: `apiKey` → `VITE_FIREBASE_API_KEY`,
etc).

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. Open it in a second tab (or your
phone, on the same wifi, using your computer's local IP) to test with
"two players."

---

## 5. Deploy for real (GitHub Pages)

### 5a. Add your Firebase keys as GitHub secrets

In your GitHub repo → **Settings → Secrets and variables → Actions** →
**New repository secret**, add each of these six (same values as your
`.env`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

These get baked into the build by the included GitHub Actions workflow —
you never commit real keys to the repo.

### 5b. Turn on GitHub Pages

Repo → **Settings → Pages** → under "Build and deployment", set
**Source** to **GitHub Actions**.

### 5c. Deploy

Push to `main` (or re-run the workflow from the **Actions** tab). After
it finishes, your site is live at:

```
https://<your-username>.github.io/chitravela/
```

Send that link to your friends. That's the whole "share this link" step
— no separate server to keep awake.

---

## How a round works (so the code makes sense)

- Whoever creates a room is the **host** — their browser advances the
  timer/phase (`lobby → choosing → drawing → reveal → ...`). If the host's
  tab goes away mid-game, the other players' browsers notice (no
  heartbeat for ~9s) and the most senior remaining player's browser
  quietly takes over — this is what actually prevents the "stuck,
  disconnected" state you ran into before.
- The current **drawer's** browser is the only one that ever reads the
  real secret word (enforced by Firestore rules, not just app logic). It
  privately validates everyone's guesses and awards points.
- Strokes, chat, and scores all sync through Firestore's real-time
  listeners — typically well under a second of lag.

## Ideas for later

- Flood-fill bucket tool on the canvas (current toolset is pen + eraser
  + undo/clear — a true fill tool needs a bit more canvas math)
- Emoji reactions floating over the board
- Word categories/difficulty selection per room
- Private custom word packs per room (right now all admin-added words
  are global)
