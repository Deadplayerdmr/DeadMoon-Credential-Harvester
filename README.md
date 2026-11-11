<div align="center">

# 🌕 DeadMoon-Credential-Harvester 🌙

**Local, Zero-Telemetry Tampermonkey Credential, OAuth Token, Netscape Cookie & Widevine `.wvd` Harvester (`deadmoon-harvesterV2.js`) with Dual Bot V3 & Standalone Extractor Modes**

[![DeadMoon Suite](https://img.shields.io/badge/🌕_DeadMoon-Tool_Suite-111827?style=for-the-badge&labelColor=000000)](https://github.com/Deadplayerdmr/)
[![Version 2.3v](https://img.shields.io/badge/Version-2.3v-8B5CF6?style=for-the-badge)](deadmoon-harvesterV2.js)
[![JavaScript](https://img.shields.io/badge/JavaScript-Userscript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)](https://www.tampermonkey.net/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-GM__cookie-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![Bot V3 Ready](https://img.shields.io/badge/DeadMoon__Bot_V3-68_Keys-10B981?style=for-the-badge)](https://github.com/Deadplayerdmr/DeadMoon-Download-Bot)

*Part of the [DeadMoon Tool Suite](https://github.com/Deadplayerdmr/) by [@Deadplayerdmr](https://github.com/Deadplayerdmr)*

</div>

---

## 🌙 Overview

**DeadMoon-Credential-Harvester** (`deadmoon-harvesterV2.js`) is a local, zero-telemetry Tampermonkey userscript that passively and actively harvests streaming audio credentials, OAuth tokens, Netscape cookies, and Widevine `.wvd` bundles directly inside your browser.

Designed as the official companion to **[DeadMoon-Download-Bot](https://github.com/Deadplayerdmr/DeadMoon-Download-Bot)**, it features a live **🌕 `DeadMoon_Downloader` Compatibility Mode** toggle that switches the HUD between full Bot V3 configuration generation (68-key `token.env` + `local_resources/*`) and a **⚡ Standalone Universal Token Extractor** for third-party CLI tools (`streamrip`, `gamdl`, `dotify-cli`, `yt-dlp`, and custom scripts).

---

## ✨ Key Features in 2.3v

### 🔀 Dual Operating Modes (`DeadMoon_Downloader` Toggle)

- **🌕 `DeadMoon_Downloader: ON` (Default)**
  - Generates the exact 68-key `token.env` matching `token.env.example` (`FORMAT=audio` default, all 8 `<PLATFORM>_ENABLED=1` flags, all 8 `<PLATFORM>_ARTIST_DOWNLOAD_ENABLED=0` flags, and `/usr/src/app/local_resources/*` container path bindings).
  - Includes one-click delivery presets in the **Master `token.env`** tab to switch cleanly between **Direct Telegram Native Audio** (`FORMAT=audio`, `COPY_FILES_PATH` blank) and **Hosted Server `.zip` Links** (`FORMAT=zip`, `COPY_FILES_PATH=/files`).
  - Exports offloaded `tidal_config.toml`, `qobuz_config.toml`, `apple_cookies.txt`, `spotify_cookies.txt`, `spotify_credentials.json`, `cookies.txt`, and `device.wvd` files matching `dl_utils/credential_migrator.py` byte-for-byte.
  - Provides one-click `/authenticate<service>` Telegram admin command copy buttons (`/authenticatedeezer`, `/authenticatetidal`, `/authenticateqobuz`, `/authenticateapple`, `/authenticatesoundcloud`).
- **⚡ `Standalone Extractor: ON`**
  - Disables all `DeadMoon-Download-Bot` container paths and `.env` scaffolding.
  - Exposes raw ARLs, Bearer/Refresh tokens, `sp_dc` cookies, Qobuz bundle secrets, and a universal `deadmoon-tokens.json` + per-site Netscape `cookies.txt` exporter.

### 🟣 Multi-Stage Deezer ARL Harvester (Auto + F12 Network / cURL Parser)

- **6-Stage Automatic Capture:** Queries `window.__DZR_APP_STATE__`, `document.cookie`, Chromium `cookieStore`, Tampermonkey `GM_cookie` (`HttpOnly` cookie store across `.deezer.com` / `www.deezer.com`), `gw-light.php?method=deezer.getUserData`, and `client.getArl` / `deezer.getArl`.
- **Instant F12 Network / cURL Smart-Extractor:** If your browser blocks `GM_cookie` from reading `HttpOnly` cookies, right-click any request in the F12 **Network** tab → **Copy as cURL** (or copy the `Cookie:` request header) and click **📋 Extract ARL from Clipboard** (or paste into the ARL input field). The script automatically regex-parses out the exact 192-character hex `arl`.

### ⚫ Built-In Tidal 24-Bit / 192 kHz Hi-Res TV Device Login

- Uses the `DeadMoon-Download-Bot` primary Tidal TV/Device OAuth client (`fX2JxdmntZWK0ixT` with `zU4XHVVkc2tDPo4t` and `7m7Ap0JC9j1cOM3n` fallbacks) and tolerant `sub_status=1002` polling via `link.tidal.com`.
- Automatically prioritizes JWT claims (`uid` → `user_id`, `exp` → `token_expiry`, `cc` → `country_code`) so regional catalog lookups and `streamrip` manifest downloads never fail on stale country codes.
- Protects captured 24-Bit TV device tokens from being overwritten by lower-tier Web Player tokens (`cid=3235` / `cid=8049`).

### 🔵 Automatic Qobuz `bundle.js` Secret Unpacker

- Scans active `play.qobuz.com` bundle scripts, decodes timezone-seeded `secrets` and `app_id`, MD5-hashes plaintext passwords automatically when exporting `qobuz_config.toml`, and builds `/authenticateqobuz` commands.

### 🔐 In-Browser Widevine `.wvd` Validator & Packer

- Drag-and-drop an existing `device.wvd` or raw `client_id.bin` + `private_key.pem` pair into the HUD to validate and pack a `pywidevine` v2 `.wvd` binary locally using WebCrypto (`RSASSA-PKCS1-v1_5`).

---

## 🎧 Supported Platforms & Artifacts

| Platform | Harvested Credentials | `DeadMoon_Downloader` V3 Output | Standalone Extractor Output |
| :--- | :--- | :--- | :--- |
| **Deezer** | 192-char `arl` cookie (`GM_cookie` + `gw-light.php` + F12 cURL/Header parser), email | `DEEZER_TOKEN` in `token.env` + `/authenticatedeezer <arl>` | Raw `arl` string + JSON |
| **Tidal** | 24-Bit TV Device `access_token`, `refresh_token`, JWT-synced `user_id`, `token_expiry`, `country_code` | `local_resources/tidal_config.toml` + `/authenticatetidal <json>` | Bearer JWT, Refresh Token, OAuth JSON |
| **Qobuz** | `user_id`, `user_auth_token`, `app_id`, unpacked `bundle.js` `secrets`, MD5 password | `local_resources/qobuz_config.toml` + `/authenticateqobuz ...` | Raw `user_auth_token`, `app_id`, `secrets` |
| **Spotify** | `.spotify.com` `sp_dc`, `sp_key`, `sp_t` cookies + `device.wvd` | `spotify_cookies.txt`, `spotify_credentials.json`, `device.wvd` | Raw `sp_dc` + Netscape `spotify_cookies.txt` |
| **Apple Music** | `media-user-token` header/cookie + storefront | `local_resources/apple_cookies.txt` (`.apple.com`, `music.apple.com`, `.music.apple.com`) + `/authenticateapple` | Raw `media-user-token` + `apple_cookies.txt` |
| **Amazon Music** | `x-amzn-authentication`, `deviceId`, `marketplaceId`, `csrf` + `device.wvd` | `AMAZON_DEVICE_TOKEN` in `token.env` + `device.wvd` | Device token JSON + `device.wvd` |
| **YouTube** | Authenticated session cookies | `local_resources/cookies.txt` | `youtube_cookies.txt` |
| **SoundCloud** | `OAuth` header token + session cookies | `SOUNDCLOUD_OAUTH_TOKEN` + `cookies.txt` + `/authenticatesoundcloud` | Raw `oauth_token` + `soundcloud_cookies.txt` |
| **Telegram Web** | `@BotFather` bot token + numeric `ADMIN_ID` | `TELEGRAM_TOKEN` & `ADMIN_ID` in `token.env` | Bot token & numeric user ID |

---

## 🚀 Installation

1. Install the **Tampermonkey** browser extension (Chrome, Brave, Edge, or Firefox).
2. Open **Tampermonkey Dashboard** → **Utilities** → **Import from file** (or click the **+** icon to create a new script) and paste the contents of `deadmoon-harvesterV2.js`.
3. Save (`Ctrl + S` / `Cmd + S`).
4. **Enable `HttpOnly` Cookie Access (Recommended for Deezer `arl` & Spotify `sp_dc`):**
   - In **Tampermonkey Dashboard** → **Settings**, set **Config Mode** to **Advanced**.
   - Scroll to **Experimental** / **Security** and ensure `GM_cookie` access is enabled.
5. Visit any supported platform (`deezer.com`, `tidal.com`, `play.qobuz.com`, `open.spotify.com`, `music.apple.com`, `music.amazon.*`, `soundcloud.com`, `youtube.com`, or `web.telegram.org`). The draggable **🌕 DeadMoon Harvester 2.3v** HUD will appear in the bottom-right corner.

---

## 🎛️ Operating Guide

Click the mode pill in the top header bar of the HUD to switch between modes at any time:

### 1. 🌕 `DeadMoon_Downloader: ON` (Bot V3 Mode)

- **Master `token.env` Tab:** Builds the complete 68-key `token.env` file for `DeadMoon-Download-Bot`.
- **Delivery Mode Presets:** Because `DeadMoon-Download-Bot` sends uncompressed native Telegram audio only when `FORMAT!=zip` and `COPY_FILES_PATH` is blank, use **🎵 Preset: Telegram Native Audio** to clear `COPY_FILES_PATH`, or **📦 Preset: Hosted Server .zip (`/files`)** when serving hosted archives.
- **Offloaded Credentials:** Multi-field secrets for Tidal, Qobuz, and Apple Music are kept out of `token.env` by default (matching `dl_utils/credential_migrator.py`) and linked via `TIDAL_CONFIG_PATH`, `QOBUZ_CONFIG_PATH`, and `APPLE_COOKIES_PATH`.
- **📦 Export `local_resources/*` Button:** Downloads all captured V3 resource files (`tidal_config.toml`, `qobuz_config.toml`, `spotify_cookies.txt`, `apple_cookies.txt`, `cookies.txt`, and `device.wvd`) in one click.
- **💬 Copy `/authenticate*` Buttons:** Copies the exact admin command (`/authenticatedeezer`, `/authenticatetidal`, `/authenticateqobuz`, `/authenticateapple`, `/authenticatesoundcloud`) to paste straight into your Telegram bot chat.

### 2. ⚡ `Standalone Extractor: ON` (Universal Mode)

- Strips away all bot-specific settings, container paths, and `token.env` templates.
- Unlocks the **🔑 Universal Token Vault (JSON)** tab and direct one-click copy buttons for raw ARLs, OAuth Bearer/Refresh tokens, `sp_dc` cookies, and per-site Netscape `cookies.txt` files.

---

## 🔒 Privacy & Security

All credentials are stored strictly inside your local browser's isolated Tampermonkey storage (`GM_setValue`). The script makes zero external telemetry requests and only communicates with `deezer.com`, `auth.tidal.com`, or `qobuz.com` when you explicitly trigger an active credential harvest. Click the **🗑️ Clear** button in the HUD at any time to wipe all stored credentials from your browser.

---

## 🌌 The DeadMoon Tool Suite

| Repository | Role in the Ecosystem |
| :--- | :--- |
| 🌕 **[DeadMoon-Download-Bot](https://github.com/Deadplayerdmr/DeadMoon-Download-Bot)** | Whitelisted 8-platform Telegram audio acquisition bot with direct lossless engines, lock-free scheduler & 477 offline tests |
| 📻 **[DeadMoon-Telegram-Broadcaster-Bot](https://github.com/Deadplayerdmr/DeadMoon-Telegram-Broadcaster-Bot)** | 24/7 automated Telegram-to-Icecast radio broadcaster with smooth 22% audio-ducked ads, `/replaytrack` & fallback rotation |
| 🌾 **[DeadMoon-Credential-Harvester](https://github.com/Deadplayerdmr/DeadMoon-Credential-Harvester)** | Local Tampermonkey userscript (`2.3v`) for harvesting streaming ARLs, OAuth tokens, Netscape cookies & Widevine `.wvd` bundles |
| 🔐 **[DeadMoon-Unified-Spotify-Provisioner](https://github.com/Deadplayerdmr/DeadMoon-Unified-Spotify-Provisioner)** | Automated Windows polyglot provisioner for Spotify Premium `sp_dc` cookies & Android Widevine L3 `device.wvd` CDMs |
| 🎶 **[DeadMoon-Playlist-Transfer-Tool](https://github.com/Deadplayerdmr/DeadMoon-Playlist-Transfer-Tool)** | Single-file Windows polyglot tool for migrating Deezer Favorites (Artists, Albums & Playlists) via CSV |
| 🤖 **[DeadMoon-OpenHands-Launcher](https://github.com/Deadplayerdmr/DeadMoon-OpenHands-Launcher)** | Zero-friction Windows launcher & installer for OpenHands with kinetic ASCII UI & automatic `winnat` port recovery |
| 🔍 **[DeadMoon-Universal-API-Verify-Script](https://github.com/Deadplayerdmr/DeadMoon-Universal-API-Verify-Script)** | Self-contained Windows LLM statistical fingerprint verifier (`lmfpd`) with Smart Auto-Heal & catalog scanner |

---

<div align="center">

**🌕 DeadMoon-Credential-Harvester 🌙** — Crafted by [@Deadplayerdmr](https://github.com/Deadplayerdmr/)

</div>
