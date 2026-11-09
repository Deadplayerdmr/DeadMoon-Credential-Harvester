// ==UserScript==
// @name         🌙 DeadMoon Credential & Token Harvester V2 (Bot V3 + Standalone)
// @namespace    https://github.com/deadplayerdmr
// @version      2.2.0
// @description  Locally harvests streaming ARLs, OAuth tokens, cookies & Widevine WVDs. Features a toggleable DeadMoon_Downloader V3 compatibility mode (68-key token.env + local_resources/*.toml/*.txt/*.json) and a Standalone Universal Extractor mode.
// @author       deadplayerdmr (DeadMoon)
// @match        *://*.deezer.com/*
// @match        *://deezer.com/*
// @match        *://*.qobuz.com/*
// @match        *://*.tidal.com/*
// @match        *://listen.tidal.com/*
// @match        *://login.tidal.com/*
// @match        *://link.tidal.com/*
// @match        *://offer.tidal.com/*
// @match        *://*.spotify.com/*
// @match        *://open.spotify.com/*
// @match        *://accounts.spotify.com/*
// @match        *://*.music.apple.com/*
// @match        *://music.apple.com/*
// @match        *://*.apple.com/*
// @match        *://music.amazon.ca/*
// @match        *://*.music.amazon.ca/*
// @match        *://music.amazon.com/*
// @match        *://*.music.amazon.com/*
// @match        *://music.amazon.co.uk/*
// @match        *://*.music.amazon.co.uk/*
// @match        *://music.amazon.de/*
// @match        *://*.music.amazon.de/*
// @match        *://music.amazon.fr/*
// @match        *://*.music.amazon.fr/*
// @match        *://music.amazon.it/*
// @match        *://*.music.amazon.it/*
// @match        *://music.amazon.es/*
// @match        *://*.music.amazon.es/*
// @match        *://music.amazon.co.jp/*
// @match        *://*.music.amazon.co.jp/*
// @match        *://music.amazon.com.au/*
// @match        *://*.music.amazon.com.au/*
// @match        *://music.amazon.com.br/*
// @match        *://*.music.amazon.com.br/*
// @match        *://music.amazon.com.mx/*
// @match        *://*.music.amazon.com.mx/*
// @match        *://music.amazon.in/*
// @match        *://*.music.amazon.in/*
// @match        *://*.soundcloud.com/*
// @match        *://soundcloud.com/*
// @match        *://*.youtube.com/*
// @match        *://youtube.com/*
// @match        *://web.telegram.org/*
// @include      *://music.amazon.tld/*
// @include      *://*.music.amazon.tld/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_cookie
// @grant        GM_setClipboard
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @connect      auth.tidal.com
// @connect      api.tidal.com
// @connect      login.tidal.com
// @connect      qobuz.com
// @connect      *.qobuz.com
// @connect      deezer.com
// @connect      *.deezer.com
// @grant        unsafeWindow
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const PREFIX = 'deadmoon.harvester.v2.';
    const V3_LEGACY_PREFIX = 'deadmoon.v3.';
    const V1_LEGACY_PREFIX = 'deadmoon.v1.';
    const HOST = location.hostname.toLowerCase();
    const PAGE = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    const ARL_HEX_RE = /\b([a-f0-9]{192})\b/i;

    // Matches patched dl_utils/admin_auth.py primary Tidal TV/Device client + streamrip fallbacks
    const TIDAL_CLIENTS = [
        { id: 'fX2JxdmntZWK0ixT', secret: '1Nm5AfDAjxrgJFJbKNWLeAyKGVGmINuXPPLHVXAvxAg=' },
        { id: 'zU4XHVVkc2tDPo4t', secret: 'VJKhDFqJPqvsPVNBV6ukXTJmwlvbttP7wlMlrc72se4=' },
        { id: '7m7Ap0JC9j1cOM3n', secret: 'vRAdA108tlvkJpTsGZS8rGZ7xTlbJ0qaZ2K9saEzsgY=' }
    ];

    const CONTAINER_PATHS = {
        QOBUZ_CONFIG_PATH: '/usr/src/app/local_resources/qobuz_config.toml',
        TIDAL_CONFIG_PATH: '/usr/src/app/local_resources/tidal_config.toml',
        SPOTIFY_COOKIES_PATH: '/usr/src/app/local_resources/spotify_cookies.txt',
        SPOTIFY_WVD_PATH: '/usr/src/app/local_resources/device.wvd',
        SPOTIFY_CREDENTIALS_PATH: '/usr/src/app/local_resources/spotify_credentials.json',
        APPLE_COOKIES_PATH: '/usr/src/app/local_resources/apple_cookies.txt',
        AMAZON_WVD_PATH: '/usr/src/app/local_resources/device.wvd',
        COOKIES_PATH: '/usr/src/app/local_resources/cookies.txt'
    };

    // Exact 68 keys matching DeadMoon_Download_BotV3 token.env & token.env.example
    const ENV_DEFAULTS = {
        TELEGRAM_TOKEN: '',
        BOT_LANG: 'en',
        ADMIN_ID: '',
        DEEZER_ENABLED: '1',
        QOBUZ_ENABLED: '1',
        TIDAL_ENABLED: '1',
        AMAZON_ENABLED: '1',
        SPOTIFY_ENABLED: '1',
        APPLE_ENABLED: '1',
        YOUTUBE_ENABLED: '1',
        SOUNDCLOUD_ENABLED: '1',
        DEEZER_ARTIST_DOWNLOAD_ENABLED: '0',
        QOBUZ_ARTIST_DOWNLOAD_ENABLED: '0',
        TIDAL_ARTIST_DOWNLOAD_ENABLED: '0',
        AMAZON_ARTIST_DOWNLOAD_ENABLED: '0',
        SPOTIFY_ARTIST_DOWNLOAD_ENABLED: '0',
        APPLE_ARTIST_DOWNLOAD_ENABLED: '0',
        YOUTUBE_ARTIST_DOWNLOAD_ENABLED: '0',
        SOUNDCLOUD_ARTIST_DOWNLOAD_ENABLED: '0',
        FALLBACK_ENABLED: '0',
        DEEZER_TOKEN: '',
        DEEZER_USERNAME: '',
        DEEZER_PASSWORD: '',
        DEEZER_PROXY: '',
        DEEZER_SESSION_REINIT_THRESHOLD: '3',
        QOBUZ_CONFIG_PATH: '/usr/src/app/local_resources/qobuz_config.toml',
        QOBUZ_USER_AUTH_TOKEN: '',
        QOBUZ_APP_ID: '',
        QOBUZ_USER_ID: '',
        QOBUZ_SECRETS: '',
        QOBUZ_EMAIL: '',
        QOBUZ_PASSWORD: '',
        TIDAL_CONFIG_PATH: '/usr/src/app/local_resources/tidal_config.toml',
        TIDAL_USER_ID: '',
        TIDAL_ACCESS_TOKEN: '',
        TIDAL_REFRESH_TOKEN: '',
        TIDAL_TOKEN_EXPIRY: '',
        TIDAL_OAUTH_TOKEN: '',
        TIDAL_COUNTRY_CODE: 'US',
        TIDAL_CUSTOM_API: '',
        SPOTIFY_COOKIES_PATH: '/usr/src/app/local_resources/spotify_cookies.txt',
        SPOTIFY_WVD_PATH: '/usr/src/app/local_resources/device.wvd',
        SPOTIFY_CREDENTIALS_PATH: '/usr/src/app/local_resources/spotify_credentials.json',
        SPOTIFY_OAUTH_TOKEN: '',
        SPOTIFY_AUDIO_QUALITY: 'aac-high,aac-medium',
        SPOTIFY_BULK_WAIT_SECONDS: '4',
        APPLE_COOKIES_PATH: '/usr/src/app/local_resources/apple_cookies.txt',
        APPLE_MEDIA_USER_TOKEN: '',
        APPLE_CODEC_PRIORITY: '',
        AMAZON_DEVICE_TOKEN: '',
        AMAZON_WVD_PATH: '/usr/src/app/local_resources/device.wvd',
        AMAZON_CLI: '',
        ENABLE_FLAC: '1',
        FORMAT: 'audio',
        MAX_RETRIES: '10',
        SEND_ALBUM_COVER: '1',
        ENGINE_TIMEOUT_SECONDS: '3600',
        STREAMRIP_MAX_CONNECTIONS: '3',
        MAX_CONCURRENT_DOWNLOADS: '2',
        MAX_QUEUED_DOWNLOADS: '1',
        MAX_ARTIST_RELEASES: '100',
        ARTIST_API_DELAY: '0.6',
        COPY_FILES_PATH: '',
        FILE_LINK_TEMPLATE: 'https://deadmoonradio.com/download/{0}',
        COOKIES_PATH: '/usr/src/app/local_resources/cookies.txt',
        SOUNDCLOUD_OAUTH_TOKEN: '',
        AUTO_DELETE_ENABLED: '1',
        AUTO_DELETE_SECONDS: '1800'
    };

    const SETTINGS_KEYS = new Set([
        'BOT_LANG',
        'DEEZER_ENABLED', 'QOBUZ_ENABLED', 'TIDAL_ENABLED', 'AMAZON_ENABLED',
        'SPOTIFY_ENABLED', 'APPLE_ENABLED', 'YOUTUBE_ENABLED', 'SOUNDCLOUD_ENABLED',
        'DEEZER_ARTIST_DOWNLOAD_ENABLED', 'QOBUZ_ARTIST_DOWNLOAD_ENABLED',
        'TIDAL_ARTIST_DOWNLOAD_ENABLED', 'AMAZON_ARTIST_DOWNLOAD_ENABLED',
        'SPOTIFY_ARTIST_DOWNLOAD_ENABLED', 'APPLE_ARTIST_DOWNLOAD_ENABLED',
        'YOUTUBE_ARTIST_DOWNLOAD_ENABLED', 'SOUNDCLOUD_ARTIST_DOWNLOAD_ENABLED',
        'FALLBACK_ENABLED', 'DEEZER_SESSION_REINIT_THRESHOLD',
        'QOBUZ_CONFIG_PATH', 'TIDAL_CONFIG_PATH',
        'SPOTIFY_COOKIES_PATH', 'SPOTIFY_WVD_PATH', 'SPOTIFY_CREDENTIALS_PATH',
        'SPOTIFY_AUDIO_QUALITY', 'SPOTIFY_BULK_WAIT_SECONDS',
        'APPLE_COOKIES_PATH', 'APPLE_CODEC_PRIORITY',
        'AMAZON_WVD_PATH', 'AMAZON_CLI',
        'ENABLE_FLAC', 'FORMAT', 'MAX_RETRIES', 'SEND_ALBUM_COVER',
        'ENGINE_TIMEOUT_SECONDS', 'STREAMRIP_MAX_CONNECTIONS',
        'MAX_CONCURRENT_DOWNLOADS', 'MAX_QUEUED_DOWNLOADS',
        'MAX_ARTIST_RELEASES', 'ARTIST_API_DELAY',
        'COPY_FILES_PATH', 'FILE_LINK_TEMPLATE', 'COOKIES_PATH',
        'AUTO_DELETE_ENABLED', 'AUTO_DELETE_SECONDS'
    ]);

    const LABELS = {
        deezer: 'Deezer',
        qobuz: 'Qobuz',
        tidal: 'Tidal (24-Bit Hi-Res)',
        spotify: 'Spotify (Web + WVD)',
        apple: 'Apple Music',
        amazon: 'Amazon Music',
        soundcloud: 'SoundCloud',
        youtube: 'YouTube',
        telegram: 'Telegram Web'
    };

    const PLATFORM = detectPlatform(HOST);

    const state = {
        values: {},
        cookies: {},
        metadata: {},
        collapsed: true,
        compatMode: true,              // Toggle: DeadMoon_Downloader V3 Mode (true) vs Standalone Extractor Mode (false)
        inlineOffloadedSecrets: false, // Toggle: Keep offloaded Tidal/Qobuz/Apple secrets blank in token.env
        tab: 'site',
        hudReady: false,
        refreshTimer: 0,
        widevine: [],
        qobuzBusy: false,
        deezerBusy: false,
        tidalBusy: false
    };

    function detectPlatform(host) {
        if (/^([a-z0-9-]+\.)*music\.amazon\.(ca|com|co\.uk|de|fr|it|es|co\.jp|com\.au|com\.br|com\.mx|in)$/i.test(host)) return 'amazon';
        if (/(^|\.)deezer\.com$/.test(host)) return 'deezer';
        if (/(^|\.)qobuz\.com$/.test(host)) return 'qobuz';
        if (/(^|\.)tidal\.com$/.test(host)) return 'tidal';
        if (/(^|\.)spotify\.com$/.test(host)) return 'spotify';
        if (/(^|\.)apple\.com$/.test(host)) return 'apple';
        if (/(^|\.)soundcloud\.com$/.test(host)) return 'soundcloud';
        if (/(^|\.)youtube\.com$/.test(host)) return 'youtube';
        if (host === 'web.telegram.org') return 'telegram';
        return null;
    }

    function gmGet(key, fallback) {
        try {
            const v2 = GM_getValue(PREFIX + key, undefined);
            if (v2 !== undefined) return v2;
            const v3 = GM_getValue(V3_LEGACY_PREFIX + key, undefined);
            if (v3 !== undefined) return v3;
            return GM_getValue(V1_LEGACY_PREFIX + key, fallback);
        } catch (_) {
            return fallback;
        }
    }

    function gmSet(key, val) {
        try {
            GM_setValue(PREFIX + key, val);
            return true;
        } catch (_) {
            return false;
        }
    }

    function loadState() {
        state.values = gmGet('values', {}) || {};
        state.cookies = gmGet('cookies', {}) || {};
        state.metadata = gmGet('metadata', {}) || {};
        state.collapsed = gmGet('collapsed', true) !== false;
        state.compatMode = gmGet('compatMode', true) !== false;
        state.inlineOffloadedSecrets = Boolean(gmGet('inlineOffloadedSecrets', false));

        for (const k of Object.keys(state.values)) {
            if (!Object.prototype.hasOwnProperty.call(ENV_DEFAULTS, k)) {
                delete state.values[k];
            }
        }
        for (const [key, path] of Object.entries(CONTAINER_PATHS)) {
            if (!state.values[key] || /^\.\//.test(state.values[key]) || /^\/tmp\//.test(state.values[key])) {
                state.values[key] = path;
            }
        }
        if (!gmGet('v3FormatMigrated', false)) {
            state.values.FORMAT = 'audio';
            state.values.COPY_FILES_PATH = '';
            state.values.DEEZER_ARTIST_DOWNLOAD_ENABLED = '0';
            gmSet('v3FormatMigrated', true);
        }
        if (!state.values.SPOTIFY_AUDIO_QUALITY) state.values.SPOTIFY_AUDIO_QUALITY = ENV_DEFAULTS.SPOTIFY_AUDIO_QUALITY;
        if (!state.values.SPOTIFY_BULK_WAIT_SECONDS || state.values.SPOTIFY_BULK_WAIT_SECONDS === '0') {
            state.values.SPOTIFY_BULK_WAIT_SECONDS = ENV_DEFAULTS.SPOTIFY_BULK_WAIT_SECONDS;
        }
        gmSet('values', state.values);
    }

    function persist(kind) {
        gmSet(kind, state[kind]);
        scheduleRefresh();
    }

    function value(key) {
        return Object.prototype.hasOwnProperty.call(state.values, key)
            ? state.values[key]
            : (ENV_DEFAULTS[key] || '');
    }

    function parseJwtClaims(token) {
        const parts = String(token || '').split('.');
        if (parts.length < 2) return {};
        try {
            const payload = JSON.parse(base64UrlDecode(parts[1]));
            return payload && typeof payload === 'object' ? payload : {};
        } catch (_) {
            return {};
        }
    }

    function jwtClientId(token) {
        const payload = parseJwtClaims(token);
        return payload.cid ? String(payload.cid) : '';
    }

    function isValidDeezerArl(candidate) {
        if (typeof candidate !== 'string') return false;
        const clean = candidate.trim().replace(/^["']|["']$/g, '');
        return /^[a-f0-9]{128,256}$/i.test(clean);
    }

    function put(key, incoming, force = false) {
        if (!key || incoming === undefined || incoming === null) return;
        if (!Object.prototype.hasOwnProperty.call(ENV_DEFAULTS, key)) return;
        const next = typeof incoming === 'string' ? incoming.trim() : String(incoming).trim();
        if (!next) return;

        if (key === 'DEEZER_TOKEN' && !force && !isValidDeezerArl(next)) {
            return;
        }

        // Protect a captured 24-bit TV Device Token + Refresh Token from being overwritten by web tokens (cid: 8049 or 3235)
        if (!force && key === 'TIDAL_ACCESS_TOKEN' && state.values.TIDAL_REFRESH_TOKEN) {
            const incomingCid = jwtClientId(next);
            if (incomingCid === '8049' || incomingCid === '3235') return;
        }

        if (state.values[key] !== next) {
            state.values[key] = next;
            if (key === 'TIDAL_ACCESS_TOKEN') decodeTidalJwt(next);
            if (/^TIDAL_(ACCESS_TOKEN|REFRESH_TOKEN|USER_ID|TOKEN_EXPIRY|COUNTRY_CODE)$/.test(key)) {
                updateTidalBlob();
            }
            persist('values');
        }
    }

    function remember(key, incoming) {
        if (incoming === undefined || incoming === null || incoming === '') return;
        if (state.metadata[key] !== incoming) {
            state.metadata[key] = incoming;
            persist('metadata');
        }
    }

    function safeParse(text) {
        if (typeof text !== 'string' || !text.length || text.length > 20_000_000) return null;
        try { return JSON.parse(text); } catch (_) { return null; }
    }

    function walk(object, callback, path = '', depth = 0, seen = new WeakSet()) {
        if (!object || typeof object !== 'object' || depth > 9 || seen.has(object)) return;
        seen.add(object);
        callback(object, path);
        for (const [key, val] of Object.entries(object)) {
            if (val && typeof val === 'object') walk(val, callback, path ? path + '.' + key : key, depth + 1, seen);
        }
    }

    function findField(object, names) {
        const wanted = new Set(names.map(n => n.toLowerCase()));
        let found;
        walk(object, node => {
            if (found !== undefined) return;
            for (const [key, val] of Object.entries(node)) {
                if (wanted.has(key.toLowerCase()) && (typeof val === 'string' || typeof val === 'number') && String(val).trim() !== '') {
                    found = String(val);
                    return;
                }
            }
        });
        return found;
    }

    function extractDeezerArlFromText(raw) {
        if (typeof raw !== 'string' || !raw) return '';
        const cookieMatch = /(?:^|[;\s"'])arl\s*=\s*([a-f0-9]{128,256})\b/i.exec(raw);
        if (cookieMatch) return cookieMatch[1];
        const jsonKeyMatch = /"(?:arl|ARL|deezer_token|DEEZER_TOKEN)"\s*:\s*"([a-f0-9]{128,256})"/i.exec(raw);
        if (jsonKeyMatch) return jsonKeyMatch[1];
        const hexMatch = ARL_HEX_RE.exec(raw);
        return hexMatch ? hexMatch[1] : '';
    }

    function base64UrlDecode(text) {
        const normalized = text.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(
            Array.from(
                atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')),
                c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
            ).join('')
        );
    }

    function bytesToBase64(bytes) {
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
        }
        return btoa(binary);
    }

    function base64ToBytes(text) {
        const binary = atob(text);
        return Uint8Array.from(binary, c => c.charCodeAt(0));
    }

    function md5Hex(input) {
        const str = unescape(encodeURIComponent(String(input || '')));
        const n = str.length;
        const words = new Uint32Array((((n + 8) >> 6) + 1) << 4);
        for (let i = 0; i < n; i++) words[i >> 2] |= str.charCodeAt(i) << ((i & 3) << 3);
        words[n >> 2] |= 0x80 << ((n & 3) << 3);
        words[words.length - 2] = n << 3;

        let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
        const s = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];
        const k = new Uint32Array(64);
        for (let i = 0; i < 64; i++) k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);

        for (let offset = 0; offset < words.length; offset += 16) {
            const aa = a, bb = b, cc = c, dd = d;
            for (let i = 0; i < 64; i++) {
                let f, g;
                if (i < 16) { f = (b & c) | (~b & d); g = i; }
                else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
                else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
                else { f = c ^ (b | ~d); g = (7 * i) % 16; }
                const temp = d;
                d = c;
                c = b;
                const sum = (a + f + k[i] + words[offset + g]) >>> 0;
                b = (b + ((sum << s[i]) | (sum >>> (32 - s[i])))) >>> 0;
                a = temp;
            }
            a = (a + aa) >>> 0;
            b = (b + bb) >>> 0;
            c = (c + cc) >>> 0;
            d = (d + dd) >>> 0;
        }
        const toHex = num => [0, 8, 16, 24].map(shift => ((num >>> shift) & 0xff).toString(16).padStart(2, '0')).join('');
        return toHex(a) + toHex(b) + toHex(c) + toHex(d);
    }

    function decodeTidalJwt(token) {
        const payload = parseJwtClaims(token);
        if (payload.uid || payload.userId || payload.sub) {
            state.values.TIDAL_USER_ID = String(payload.uid || payload.userId || payload.sub);
        }
        if (payload.exp) {
            state.values.TIDAL_TOKEN_EXPIRY = String(payload.exp);
        }
        if (payload.cc || payload.countryCode || payload.country) {
            state.values.TIDAL_COUNTRY_CODE = String(payload.cc || payload.countryCode || payload.country).toUpperCase();
        }
        if (payload.cid) {
            remember('tidalClientId', String(payload.cid));
        }
    }

    function resolvedTidalFields() {
        const access = value('TIDAL_ACCESS_TOKEN');
        const claims = parseJwtClaims(access);
        const uid = String(claims.uid || value('TIDAL_USER_ID') || '');
        const expiry = String(claims.exp || value('TIDAL_TOKEN_EXPIRY') || '');
        const cc = String(claims.cc || value('TIDAL_COUNTRY_CODE') || 'US').toUpperCase();
        return {
            user_id: uid,
            token_type: 'Bearer',
            access_token: String(access || ''),
            refresh_token: String(value('TIDAL_REFRESH_TOKEN') || ''),
            token_expiry: expiry,
            country_code: cc
        };
    }

    function updateTidalBlob() {
        const fields = resolvedTidalFields();
        if (!fields.user_id || !fields.access_token || !fields.refresh_token) {
            state.values.TIDAL_OAUTH_TOKEN = '';
            gmSet('values', state.values);
            return;
        }
        state.values.TIDAL_USER_ID = fields.user_id;
        state.values.TIDAL_TOKEN_EXPIRY = fields.token_expiry;
        state.values.TIDAL_COUNTRY_CODE = fields.country_code;
        state.values.TIDAL_OAUTH_TOKEN = JSON.stringify(fields);
        gmSet('values', state.values);
    }

    loadState();
    updateTidalBlob();

    function getSpotifySpDc() {
        if (state.metadata.sp_dc && String(state.metadata.sp_dc).length >= 20) {
            return String(state.metadata.sp_dc).trim();
        }
        const cookies = state.cookies.spotify || [];
        const found = cookies.find(c => c.name === 'sp_dc' && c.value);
        return found ? String(found.value).trim() : '';
    }

    function isPlatformReady(plat) {
        if (plat === 'deezer') return value('DEEZER_TOKEN').length >= 50;
        if (plat === 'qobuz') {
            return Boolean(
                (value('QOBUZ_USER_AUTH_TOKEN') && value('QOBUZ_APP_ID')) ||
                (value('QOBUZ_USER_ID') && value('QOBUZ_SECRETS')) ||
                (value('QOBUZ_EMAIL') && value('QOBUZ_PASSWORD'))
            );
        }
        if (plat === 'tidal') {
            return Boolean(value('TIDAL_USER_ID') && value('TIDAL_ACCESS_TOKEN') && value('TIDAL_REFRESH_TOKEN'));
        }
        if (plat === 'spotify') return Boolean(getSpotifySpDc());
        if (plat === 'apple') return Boolean(value('APPLE_MEDIA_USER_TOKEN'));
        if (plat === 'amazon') return Boolean(value('AMAZON_DEVICE_TOKEN') && wvdBytes());
        if (plat === 'soundcloud') return Boolean(value('SOUNDCLOUD_OAUTH_TOKEN') || (state.cookies.soundcloud || []).length);
        if (plat === 'youtube') return Boolean((state.cookies.youtube || []).length);
        if (plat === 'telegram') return Boolean(value('TELEGRAM_TOKEN') && value('ADMIN_ID'));
        return false;
    }

    function isPlatformPartial(plat) {
        if (isPlatformReady(plat)) return false;
        if (plat === 'deezer') return Boolean(value('DEEZER_USERNAME') || state.metadata.deezerCheckForm);
        if (plat === 'tidal') return Boolean(value('TIDAL_ACCESS_TOKEN') || value('TIDAL_USER_ID'));
        if (plat === 'qobuz') return Boolean(value('QOBUZ_APP_ID') || value('QOBUZ_USER_AUTH_TOKEN') || value('QOBUZ_SECRETS'));
        if (plat === 'amazon') return Boolean(value('AMAZON_DEVICE_TOKEN') || wvdBytes());
        if (plat === 'telegram') return Boolean(value('TELEGRAM_TOKEN') || value('ADMIN_ID'));
        return false;
    }

    function headerObject(headers) {
        const result = {};
        if (!headers) return result;
        try {
            if (typeof headers.forEach === 'function') {
                headers.forEach((val, key) => { result[String(key).toLowerCase()] = String(val); });
            } else if (Array.isArray(headers)) {
                for (const pair of headers) if (pair && pair.length > 1) result[String(pair[0]).toLowerCase()] = String(pair[1]);
            } else {
                for (const [key, val] of Object.entries(headers)) result[key.toLowerCase()] = String(val);
            }
        } catch (_) {}
        return result;
    }

    function bearer(headers) {
        const auth = headers.authorization || '';
        const match = /^Bearer\s+(.+)$/i.exec(auth);
        return match ? match[1].trim() : '';
    }

    function parseDeezerPayload(data, rawText = '', urlStr = '') {
        if (urlStr) {
            try {
                const u = new URL(urlStr, location.href);
                const apiTok = u.searchParams.get('api_token');
                if (apiTok && apiTok !== 'null' && apiTok.length > 8) {
                    remember('deezerCheckForm', apiTok);
                }
                const queryArl = u.searchParams.get('arl');
                if (isValidDeezerArl(queryArl)) put('DEEZER_TOKEN', queryArl);
            } catch (_) {}
        }

        if (rawText) {
            const extracted = extractDeezerArlFromText(rawText);
            if (isValidDeezerArl(extracted)) put('DEEZER_TOKEN', extracted);
        }

        if (!data || typeof data !== 'object') return;

        const results = data.results !== undefined ? data.results : data;
        if (typeof results === 'string' && isValidDeezerArl(results)) {
            put('DEEZER_TOKEN', results);
            return;
        }

        if (results && typeof results === 'object') {
            const user = results.USER || data.USER || results.user;
            if (user && typeof user === 'object') {
                put('DEEZER_USERNAME', user.EMAIL || user.email);
                remember('deezerUserId', user.USER_ID || user.id);
            }
            if (results.checkForm && typeof results.checkForm === 'string') {
                remember('deezerCheckForm', results.checkForm);
            }
            if (results.SESSION_ID || results.sid || results.SID) {
                remember('deezerSid', results.SESSION_ID || results.sid || results.SID);
            }
            if (results.USER_TOKEN && isValidDeezerArl(String(results.USER_TOKEN))) {
                put('DEEZER_TOKEN', String(results.USER_TOKEN));
            }
            if (isValidDeezerArl(results.arl || results.ARL)) {
                put('DEEZER_TOKEN', results.arl || results.ARL);
            }
        }

        walk(data, node => {
            for (const [k, v] of Object.entries(node)) {
                const lower = k.toLowerCase();
                if ((lower === 'arl' || lower === 'deezer_token') && typeof v === 'string' && isValidDeezerArl(v)) {
                    put('DEEZER_TOKEN', v);
                } else if (lower === 'checkform' && typeof v === 'string' && v.length > 8) {
                    remember('deezerCheckForm', v);
                } else if (lower === 'email' && typeof v === 'string' && v.includes('@') && !value('DEEZER_USERNAME')) {
                    put('DEEZER_USERNAME', v);
                } else if (typeof v === 'string' && v.length === 192 && isValidDeezerArl(v)) {
                    put('DEEZER_TOKEN', v);
                }
            }
        });
    }

    function parseRequest(url, headers, body) {
        if (!PLATFORM || !url) return;
        let parsed;
        try { parsed = new URL(url, location.href); } catch (_) { return; }
        const host = parsed.hostname.toLowerCase();
        const textBody = typeof body === 'string' ? body : '';

        if (PLATFORM === 'deezer' && /(^|\.)deezer\.com$/.test(host)) {
            const headerStr = JSON.stringify(headers || {});
            const fromHeaders = extractDeezerArlFromText(headerStr);
            if (isValidDeezerArl(fromHeaders)) put('DEEZER_TOKEN', fromHeaders);
            parseDeezerPayload(safeParse(textBody), textBody, parsed.href);
        } else if (PLATFORM === 'tidal' && /(^|\.)(api|auth|login|listen)\.tidal\.com$/.test(host)) {
            const token = bearer(headers);
            if (token) put('TIDAL_ACCESS_TOKEN', token);
            if (textBody.includes('refresh_token=')) {
                const params = new URLSearchParams(textBody);
                if (params.get('refresh_token')) put('TIDAL_REFRESH_TOKEN', params.get('refresh_token'), true);
            }
            const data = safeParse(textBody);
            if (data) parseTidal(data, parsed.pathname);
        } else if (PLATFORM === 'spotify' && /(^|\.)(api|spclient\.wg|open|accounts)\.spotify\.com$/.test(host)) {
            const token = bearer(headers);
            if (token) put('SPOTIFY_OAUTH_TOKEN', token);
        } else if (PLATFORM === 'apple' && /(^|\.)amp-api\.music\.apple\.com$/.test(host)) {
            put('APPLE_MEDIA_USER_TOKEN', headers['media-user-token']);
            remember('appleDeveloperToken', bearer(headers));
        } else if (PLATFORM === 'amazon' && isAmazonApiHost(host)) {
            captureAmazonRequest(parsed, headers, textBody);
        } else if (PLATFORM === 'qobuz' && /(^|\.)qobuz\.com$/.test(host) && parsed.pathname.includes('/api.json/')) {
            put('QOBUZ_APP_ID', headers['x-app-id'] || parsed.searchParams.get('app_id'));
            put('QOBUZ_USER_AUTH_TOKEN', headers['x-user-auth-token'] || parsed.searchParams.get('user_auth_token'));
        } else if (PLATFORM === 'soundcloud' && /(^|\.)api-v2\.soundcloud\.com$/.test(host)) {
            const auth = headers.authorization || '';
            const match = /^OAuth\s+(.+)$/i.exec(auth);
            if (match) put('SOUNDCLOUD_OAUTH_TOKEN', match[1]);
            put('SOUNDCLOUD_OAUTH_TOKEN', parsed.searchParams.get('oauth_token'));
        }
    }

    function parseResponse(url, text, responseHeaders = '') {
        if (!PLATFORM) return;
        let parsed;
        try { parsed = new URL(url, location.href); } catch (_) { return; }
        const host = parsed.hostname.toLowerCase();

        if (PLATFORM === 'deezer' && /(^|\.)deezer\.com$/.test(host)) {
            if (responseHeaders) {
                const fromResHeaders = extractDeezerArlFromText(responseHeaders);
                if (isValidDeezerArl(fromResHeaders)) put('DEEZER_TOKEN', fromResHeaders);
            }
            const data = safeParse(text);
            parseDeezerPayload(data, text, parsed.href);
            return;
        }

        if (!text) return;
        const data = safeParse(text);
        if (!data) return;

        if (PLATFORM === 'tidal' && /(^|\.)(api|auth|login|listen)\.tidal\.com$/.test(host)) {
            parseTidal(data, parsed.pathname);
        } else if (PLATFORM === 'spotify' && /(^|\.)spotify\.com$/.test(host)) {
            put('SPOTIFY_OAUTH_TOKEN', findField(data, ['accessToken', 'access_token']));
            if (parsed.pathname === '/v1/me' || findField(data, ['product'])) {
                remember('spotifyUsername', findField(data, ['id', 'username', 'uri']));
            }
        } else if (PLATFORM === 'qobuz' && /(^|\.)qobuz\.com$/.test(host)) {
            put('QOBUZ_USER_ID', findField(data, ['id']) && parsed.pathname.includes('/user/') ? findField(data, ['id']) : findField(data, ['user_id']));
            put('QOBUZ_EMAIL', findField(data, ['email']));
            put('QOBUZ_USER_AUTH_TOKEN', findField(data, ['user_auth_token']));
        } else if (PLATFORM === 'amazon' && isAmazonApiHost(host)) {
            captureAmazonData(data);
        } else if (PLATFORM === 'apple' && /(^|\.)amp-api\.music\.apple\.com$/.test(host)) {
            remember('appleStorefront', findField(data, ['storefrontId', 'storefront']));
        } else if (PLATFORM === 'telegram') {
            captureTelegramData(data);
        }
    }

    function parseTidal(data, path) {
        const refresh = findField(data, ['refresh_token', 'refreshToken']);
        if (refresh) put('TIDAL_REFRESH_TOKEN', refresh, true);
        const token = findField(data, ['access_token', 'accessToken']);
        if (token) put('TIDAL_ACCESS_TOKEN', token, Boolean(refresh));
        const uid = findField(data, ['userId', 'user_id']);
        if (uid && /^\d+$/.test(String(uid))) put('TIDAL_USER_ID', uid);
        const cc = findField(data, ['countryCode', 'country_code']);
        if (cc && /^[A-Z]{2}$/i.test(String(cc))) put('TIDAL_COUNTRY_CODE', String(cc).toUpperCase());

        const expiresAt = findField(data, ['expires_at', 'token_expiry', 'expiry', 'expiration']);
        const expiresIn = findField(data, ['expires_in']);
        if (expiresAt && Number(expiresAt) > 1_000_000_000) {
            put('TIDAL_TOKEN_EXPIRY', Math.floor(Number(expiresAt) > 10_000_000_000 ? Number(expiresAt) / 1000 : Number(expiresAt)));
        } else if (expiresIn && Number(expiresIn) > 0) {
            put('TIDAL_TOKEN_EXPIRY', String(Math.floor(Date.now() / 1000) + Number(expiresIn)));
        }
        if (path && path.includes('/sessions')) {
            walk(data, node => {
                if (node.userId) put('TIDAL_USER_ID', node.userId);
                if (node.countryCode) put('TIDAL_COUNTRY_CODE', node.countryCode);
            });
        }
        updateTidalBlob();
    }

    // ============================================================================
    // TIDAL 24-BIT HI-RES DEVICE LOGIN (MATCHING dl_utils/admin_auth.py)
    // ============================================================================
    function getPendingTidal() {
        const pending = gmGet('pendingTidalDevice', null);
        if (!pending || !pending.deviceCode || Date.now() > (pending.expiresAt || 0)) return null;
        return pending;
    }

    function tidalPostNoAuthHeader(url, form) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'function') {
                reject(new Error('GM_xmlhttpRequest is required for Tidal OAuth.'));
                return;
            }
            GM_xmlhttpRequest({
                method: 'POST',
                url,
                anonymous: true,
                data: new URLSearchParams(form).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                responseType: 'text',
                timeout: 20000,
                onload: response => {
                    const data = safeParse(response.responseText) || {};
                    if (response.status >= 200 && response.status < 300) resolve(data);
                    else reject(Object.assign(new Error(data.error_description || data.error || ('Tidal HTTP ' + response.status)), { status: response.status, data }));
                },
                onerror: () => reject(new Error('Could not reach Tidal OAuth server.')),
                ontimeout: () => reject(new Error('Tidal OAuth request timed out.'))
            });
        });
    }

    function saveTidalTokenData(tokenData) {
        const access = tokenData.access_token || tokenData.accessToken || '';
        const claims = parseJwtClaims(access);
        const userObj = tokenData.user && typeof tokenData.user === 'object' ? tokenData.user : {};
        const expiry = claims.exp
            ? String(claims.exp)
            : String(Math.floor(Date.now() / 1000) + (Number(tokenData.expires_in || tokenData.expiresIn) || 86400));
        const uid = claims.uid || tokenData.user_id || tokenData.userId || userObj.userId || userObj.id || '';
        const cc = claims.cc || tokenData.country_code || tokenData.countryCode || userObj.countryCode || 'US';

        if (tokenData.refresh_token || tokenData.refreshToken) {
            put('TIDAL_REFRESH_TOKEN', tokenData.refresh_token || tokenData.refreshToken, true);
        }
        if (access) put('TIDAL_ACCESS_TOKEN', access, true);
        if (uid) put('TIDAL_USER_ID', String(uid), true);
        if (cc) put('TIDAL_COUNTRY_CODE', String(cc).toUpperCase(), true);
        put('TIDAL_TOKEN_EXPIRY', expiry, true);
        updateTidalBlob();
        gmSet('pendingTidalDevice', null);
        loadState();
        scheduleRefresh();
    }

    async function tryExchangePendingTidal(silent = false) {
        const pending = getPendingTidal();
        if (!pending) {
            if (!silent) toast('🌑 No active device code found. Click "Start 24-Bit Hi-Res Device Login" first.');
            return false;
        }
        try {
            const tokenData = await tidalPostNoAuthHeader('https://auth.tidal.com/v1/oauth2/token', {
                client_id: pending.clientId,
                client_secret: pending.clientSecret,
                device_code: pending.deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                scope: 'r_usr w_usr w_sub'
            });
            if (tokenData && (tokenData.access_token || tokenData.accessToken)) {
                saveTidalTokenData(tokenData);
                toast('🌕 24-Bit Hi-Res Tidal OAuth + Refresh Token captured!');
                return true;
            }
        } catch (err) {
            const data = (err && err.data) || {};
            const bodyStr = JSON.stringify(data).toLowerCase();
            const isPending =
                data.error === 'authorization_pending' ||
                data.error === 'slow_down' ||
                String(data.sub_status || '') === '1002' ||
                bodyStr.includes('authorization_pending') ||
                bodyStr.includes('1002');
            if (!silent && !isPending) {
                toast('🌓 Waiting for approval or token exchange: ' + (err.message || String(err)));
            } else if (!silent && isPending) {
                toast('🌔 Waiting for you to approve code ' + (pending.userCode || '') + ' on link.tidal.com…');
            }
        }
        return false;
    }

    async function startTidalDeviceFlow() {
        if (state.tidalBusy) return;
        state.tidalBusy = true;
        scheduleRefresh();
        try {
            toast('🌒 Requesting 24-Bit Hi-Res Tidal TV device code…');
            let auth = null;
            let activeClient = TIDAL_CLIENTS[0];
            let lastErr = null;

            for (const candidate of TIDAL_CLIENTS) {
                try {
                    auth = await tidalPostNoAuthHeader(
                        'https://auth.tidal.com/v1/oauth2/device_authorization',
                        {
                            client_id: candidate.id,
                            client_secret: candidate.secret,
                            scope: 'r_usr w_usr w_sub'
                        }
                    );
                    if (auth && (auth.device_code || auth.deviceCode)) {
                        activeClient = candidate;
                        break;
                    }
                } catch (e) {
                    lastErr = e;
                }
            }
            const deviceCode = auth && (auth.device_code || auth.deviceCode);
            const userCode = auth && (auth.user_code || auth.userCode);
            if (!deviceCode || !userCode) throw lastErr || new Error('Tidal device_authorization failed.');

            const rawLink = auth.verification_uri_complete || auth.verificationUriComplete || auth.verification_uri || auth.verificationUri || `https://link.tidal.com/${userCode}`;
            const link = /^https?:\/\//i.test(rawLink) ? rawLink : 'https://' + rawLink;
            const expiresAt = Date.now() + Math.max(60, Number(auth.expires_in || auth.expiresIn) || 300) * 1000;

            gmSet('pendingTidalDevice', {
                deviceCode,
                userCode,
                verificationUrl: link,
                clientId: activeClient.id,
                clientSecret: activeClient.secret,
                expiresAt
            });
            scheduleRefresh();

            PAGE.open(link, '_blank', 'noopener,noreferrer');
            toast('🌔 Approve in opened link.tidal.com tab (Code: ' + userCode + ')…');

            const interval = Math.max(3, Number(auth.interval) || 5) * 1000;
            while (Date.now() < expiresAt) {
                await new Promise(resolve => setTimeout(resolve, interval));
                loadState();
                if (value('TIDAL_REFRESH_TOKEN')) {
                    toast('🌕 24-Bit Hi-Res Tidal Refresh Token captured!');
                    return;
                }
                const done = await tryExchangePendingTidal(true);
                if (done) return;
            }
            throw new Error('Tidal device authorization window expired.');
        } catch (error) {
            toast('🌑 Tidal Device Flow: ' + (error.message || String(error)));
        } finally {
            state.tidalBusy = false;
            scheduleRefresh();
        }
    }

    // ============================================================================
    // DEEZER MULTI-STAGE ARL HARVESTER (Cookies + CookieStore + gw-light + XHR)
    // ============================================================================
    async function harvestDeezerArl(silent = false) {
        if (PLATFORM !== 'deezer' || state.deezerBusy) return false;
        state.deezerBusy = true;
        scheduleRefresh();
        try {
            // 1. Inspect window.__DZR_APP_STATE__ and document.cookie first
            inspectDeezerAppState();
            const docArl = extractDeezerArlFromText(document.cookie || '');
            if (isValidDeezerArl(docArl)) {
                put('DEEZER_TOKEN', docArl);
                if (!silent) toast('🌕 Deezer ARL captured from browser cookies!');
                return true;
            }

            // 2. Try Chromium CookieStore API if exposed
            if (PAGE.cookieStore && typeof PAGE.cookieStore.get === 'function') {
                try {
                    const csCookie = await PAGE.cookieStore.get('arl');
                    if (csCookie && isValidDeezerArl(csCookie.value)) {
                        put('DEEZER_TOKEN', csCookie.value);
                        if (!silent) toast('🌕 Deezer ARL captured via CookieStore API!');
                        return true;
                    }
                } catch (_) {}
            }

            // 3. Query Tampermonkey GM_cookie across all Deezer domain/url permutations (reads HttpOnly arl)
            await scanCookies();
            if (isValidDeezerArl(value('DEEZER_TOKEN'))) {
                if (!silent) toast('🌕 Deezer ARL captured via GM_cookie (HttpOnly)!');
                return true;
            }

            // 4. Query gw-light.php?method=deezer.getUserData to grab EMAIL, checkForm & any embedded ARL
            let apiToken = state.metadata.deezerCheckForm || '';
            if (PAGE && typeof PAGE.fetch === 'function') {
                try {
                    const userResponse = await PAGE.fetch(
                        `${location.origin}/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=`,
                        {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: '{}'
                        }
                    );
                    if (userResponse.ok) {
                        const rawUser = await userResponse.text();
                        const userData = safeParse(rawUser);
                        parseDeezerPayload(userData, rawUser);
                        if (userData && userData.results && userData.results.checkForm) {
                            apiToken = userData.results.checkForm;
                        }
                    }
                } catch (_) {}
            }

            if (isValidDeezerArl(value('DEEZER_TOKEN'))) {
                if (!silent) toast('🌕 Deezer ARL captured via deezer.getUserData!');
                return true;
            }

            // 5. Try client.getArl & deezer.getArl with captured checkForm api_token
            if (apiToken && PAGE && typeof PAGE.fetch === 'function') {
                for (const method of ['client.getArl', 'deezer.getArl']) {
                    try {
                        const arlResp = await PAGE.fetch(
                            `${location.origin}/ajax/gw-light.php?method=${method}&input=3&api_version=1.0&api_token=${encodeURIComponent(apiToken)}`,
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: '{}'
                            }
                        );
                        if (arlResp.ok) {
                            const rawArl = await arlResp.text();
                            const arlData = safeParse(rawArl);
                            parseDeezerPayload(arlData, rawArl);
                            if (isValidDeezerArl(value('DEEZER_TOKEN'))) {
                                if (!silent) toast(`🌕 Deezer ARL captured via ${method}!`);
                                return true;
                            }
                        }
                    } catch (_) {}
                }
            }

            // 6. Try GM_xmlhttpRequest with browser cookies attached and inspect response + Set-Cookie headers
            if (typeof GM_xmlhttpRequest === 'function') {
                try {
                    const gmResp = await gmRequest({
                        method: 'POST',
                        url: `https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=`,
                        headers: { 'Content-Type': 'application/json' },
                        data: '{}',
                        anonymous: false
                    });
                    if (gmResp) {
                        parseResponse(
                            'https://www.deezer.com/ajax/gw-light.php',
                            gmResp.responseText || '',
                            gmResp.responseHeaders || ''
                        );
                    }
                } catch (_) {}
            }

            // Final check of storage & cookies
            scanStorage(PAGE.localStorage);
            scanStorage(PAGE.sessionStorage);
            await scanCookies();

            if (isValidDeezerArl(value('DEEZER_TOKEN'))) {
                if (!silent) toast('🌕 Deezer ARL captured!');
                return true;
            }

            if (!silent) {
                toast('🌓 Deezer hides "arl" as HttpOnly: enable Tampermonkey Settings -> Advanced -> Cookie API, or paste your Network tab Cookie/cURL into the ARL box below!');
            }
            return false;
        } catch (error) {
            if (!silent) toast('🌑 Deezer ARL: ' + (error.message || String(error)));
            return false;
        } finally {
            state.deezerBusy = false;
            scheduleRefresh();
        }
    }

    function isAmazonApiHost(host) {
        return detectPlatform(host) === 'amazon' || /^(na|eu|fe)\.mesk\.skill\.music\.a2z\.com$/.test(host) || /(^|\.)amazon\.(ca|com|co\.uk|de|fr|it|es|co\.jp|com\.au|com\.br|com\.mx|in)$/.test(host);
    }

    function captureAmazonRequest(parsed, headers, body) {
        const existing = safeParse(value('AMAZON_DEVICE_TOKEN')) || {};
        const config = Object.assign({}, existing);
        if (headers['x-amzn-device-id']) config.deviceId = headers['x-amzn-device-id'];
        if (headers['x-amzn-authentication']) config.accessToken = headers['x-amzn-authentication'];
        if (headers['x-amzn-music-domain']) config.musicDomain = headers['x-amzn-music-domain'];
        if (headers['x-amzn-csrf']) config.csrfToken = headers['x-amzn-csrf'];
        const data = safeParse(body);
        if (data) {
            captureAmazonData(data);
            Object.assign(config, safeParse(value('AMAZON_DEVICE_TOKEN')) || {});
        }
        if (headers['x-amzn-device-id'] || headers['x-amzn-authentication']) {
            saveAmazonConfig(config);
        }
    }

    function captureAmazonData(data, save = true) {
        const config = safeParse(value('AMAZON_DEVICE_TOKEN')) || {};
        walk(data, (node, path) => {
            const deviceId = node.deviceId || node.device_id || node.deviceSerialNumber;
            const deviceType = node.deviceType || node.device_type;
            const accessToken = node.accessToken || node.access_token;
            const marketplaceId = node.marketplaceId || node.marketplace_id || node.marketplace;
            if (deviceId) config.deviceId = deviceId;
            if (deviceType) config.deviceType = deviceType;
            if (accessToken) config.accessToken = accessToken;
            if (marketplaceId && /^[A-Z0-9]{10,20}$/.test(String(marketplaceId))) config.marketplaceId = marketplaceId;
            if (node.csrf && typeof node.csrf === 'object') {
                config.csrf = {
                    token: node.csrf.token || node.csrf.csrf || '',
                    ts: node.csrf.ts || node.csrf.timestamp || '',
                    rnd: node.csrf.rnd || node.csrf.random || ''
                };
            }
            if (path.endsWith('appConfig') && node.customerId) config.customerId = node.customerId;
        });
        if (save && Object.keys(config).length) saveAmazonConfig(config);
    }

    function saveAmazonConfig(config) {
        if (!config || typeof config !== 'object' || !Object.keys(config).length) return;
        put('AMAZON_DEVICE_TOKEN', JSON.stringify(config));
    }

    function captureTelegramData(data) {
        const id = findField(data, ['user_id', 'userId']);
        if (id && /^\d{4,20}$/.test(id)) put('ADMIN_ID', id);
    }

    function inspectResponse(response, url) {
        if (!response || typeof response.clone !== 'function') return;
        try {
            const copy = response.clone();
            Promise.resolve(copy.text()).then(text => {
                try { parseResponse(url, text); } catch (_) {}
            }).catch(() => {});
        } catch (_) {}
    }

    function installNetworkHooks() {
        if (!PAGE || !PAGE.XMLHttpRequest) return;
        try {
            const nativeFetch = PAGE.fetch;
            if (typeof nativeFetch === 'function' && !nativeFetch.__deadmoonHarvested) {
                const wrappedFetch = function (input, init) {
                    let url = '';
                    try {
                        url = typeof input === 'string' ? input : input.url;
                        const initHeaders = headerObject(init && init.headers);
                        const inputHeaders = input && input.headers ? headerObject(input.headers) : {};
                        parseRequest(url, Object.assign(inputHeaders, initHeaders), init && init.body);
                    } catch (_) {}
                    const original = nativeFetch.apply(this, arguments);
                    Promise.resolve(original).then(response => inspectResponse(response, url)).catch(() => {});
                    return original;
                };
                Object.defineProperty(wrappedFetch, '__deadmoonHarvested', { value: true });
                PAGE.fetch = wrappedFetch;
            }
        } catch (_) {}

        try {
            const proto = PAGE.XMLHttpRequest.prototype;
            if (proto.open.__deadmoonHarvested) return;
            const nativeOpen = proto.open;
            const nativeSend = proto.send;
            const nativeSetHeader = proto.setRequestHeader;
            proto.open = function (method, url) {
                this.__deadmoonUrl = String(url);
                this.__deadmoonHeaders = {};
                return nativeOpen.apply(this, arguments);
            };
            proto.setRequestHeader = function (name, val) {
                try { this.__deadmoonHeaders[String(name).toLowerCase()] = String(val); } catch (_) {}
                return nativeSetHeader.apply(this, arguments);
            };
            proto.send = function (body) {
                try {
                    parseRequest(this.__deadmoonUrl, this.__deadmoonHeaders || {}, body);
                    this.addEventListener('load', () => {
                        try {
                            const resHeaders = typeof this.getAllResponseHeaders === 'function' ? this.getAllResponseHeaders() : '';
                            const type = this.responseType;
                            if (!type || type === 'text') {
                                parseResponse(this.__deadmoonUrl, this.responseText || '', resHeaders);
                            } else if (type === 'json') {
                                parseResponse(this.__deadmoonUrl, JSON.stringify(this.response), resHeaders);
                            }
                        } catch (_) {}
                    });
                } catch (_) {}
                return nativeSend.apply(this, arguments);
            };
            Object.defineProperty(proto.open, '__deadmoonHarvested', { value: true });
        } catch (_) {}
    }

    function scanStorage(storage) {
        if (!storage) return;
        let keys = [];
        try {
            for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
            for (const key of keys) {
                const raw = storage.getItem(key);
                if (raw === null || raw.length > 5_000_000) continue;
                scanStorageEntry(key, raw);
            }
        } catch (_) {}
    }

    function scanStorageEntry(key, raw) {
        const lower = String(key || '').toLowerCase();
        const data = safeParse(raw);
        if (PLATFORM === 'apple') {
            if (lower.includes('media-user-token') || lower.includes('media_user_token')) {
                put('APPLE_MEDIA_USER_TOKEN', data ? findField(data, ['token', 'media-user-token']) : raw);
            }
        } else if (PLATFORM === 'tidal') {
            if (data) parseTidal(data, '/storage');
            else if (lower.includes('refresh') && raw.length > 15) put('TIDAL_REFRESH_TOKEN', raw.replace(/^"|"$/g, ''), true);
            else if (/^eyJ/.test(raw)) put('TIDAL_ACCESS_TOKEN', raw.replace(/^"|"$/g, ''));
        } else if (PLATFORM === 'spotify') {
            if (data) {
                put('SPOTIFY_OAUTH_TOKEN', findField(data, ['accessToken', 'access_token']));
                remember('spotifyUsername', findField(data, ['username']));
            }
        } else if (PLATFORM === 'qobuz') {
            if (data) {
                put('QOBUZ_APP_ID', findField(data, ['app_id', 'appId']));
                put('QOBUZ_USER_AUTH_TOKEN', findField(data, ['user_auth_token', 'userAuthToken']));
                put('QOBUZ_USER_ID', findField(data, ['user_id', 'userId']));
                put('QOBUZ_EMAIL', findField(data, ['email']));
            }
        } else if (PLATFORM === 'amazon') {
            if (data) captureAmazonData(data);
        } else if (PLATFORM === 'deezer') {
            const arlFromRaw = extractDeezerArlFromText(raw);
            if (isValidDeezerArl(arlFromRaw)) put('DEEZER_TOKEN', arlFromRaw);
            if (data) parseDeezerPayload(data, raw);
        } else if (PLATFORM === 'soundcloud' && lower.includes('oauth')) {
            put('SOUNDCLOUD_OAUTH_TOKEN', data ? findField(data, ['oauth_token', 'access_token']) : raw);
        } else if (PLATFORM === 'telegram') {
            if (key === 'user_auth' || /^account\d*$/.test(key)) {
                const id = data ? findField(data, ['id', 'user_id', 'userId']) : raw;
                if (id && /^\d{4,20}$/.test(id)) put('ADMIN_ID', id);
            }
        }
    }

    function scanIndexedDb() {
        const idb = PAGE.indexedDB;
        if (!idb || typeof idb.databases !== 'function') return;
        Promise.resolve(idb.databases()).then(databases => {
            for (const info of databases.slice(0, 30)) {
                if (!info.name) continue;
                let db;
                try {
                    const request = idb.open(info.name);
                    request.onerror = () => {};
                    request.onsuccess = () => {
                        db = request.result;
                        try {
                            for (const name of Array.from(db.objectStoreNames).slice(0, 40)) {
                                try {
                                    const tx = db.transaction(name, 'readonly');
                                    const cursorRequest = tx.objectStore(name).openCursor();
                                    let count = 0;
                                    cursorRequest.onerror = () => {};
                                    cursorRequest.onsuccess = () => {
                                        const cursor = cursorRequest.result;
                                        if (!cursor || count++ >= 250) return;
                                        try {
                                            const raw = typeof cursor.value === 'string' ? cursor.value : JSON.stringify(cursor.value);
                                            if (raw && raw.length < 5_000_000) scanStorageEntry(String(cursor.key || name), raw);
                                        } catch (_) {}
                                        cursor.continue();
                                    };
                                } catch (_) {}
                            }
                        } catch (_) {}
                        setTimeout(() => { try { db.close(); } catch (_) {} }, 3000);
                    };
                } catch (_) { if (db) try { db.close(); } catch (_) {} }
            }
        }).catch(() => {});
    }

    function cookieDomains() {
        if (PLATFORM === 'apple') return ['.apple.com', 'music.apple.com', '.music.apple.com'];
        if (PLATFORM === 'deezer') return ['.deezer.com', 'www.deezer.com', 'deezer.com'];
        if (PLATFORM === 'spotify') return ['.spotify.com', 'open.spotify.com'];
        if (PLATFORM === 'soundcloud') return ['.soundcloud.com'];
        if (PLATFORM === 'youtube') return ['.youtube.com'];
        if (PLATFORM === 'amazon') {
            const match = HOST.match(/music\.(amazon\..+)$/);
            return match ? ['.' + match[1], HOST] : [HOST];
        }
        return [HOST];
    }

    function gmCookieList(details) {
        return new Promise(resolve => {
            if (typeof GM_cookie === 'undefined' || !GM_cookie || typeof GM_cookie.list !== 'function') {
                resolve([]);
                return;
            }
            let settled = false;
            const done = cookies => {
                if (!settled) { settled = true; resolve(Array.isArray(cookies) ? cookies : []); }
            };
            try {
                const result = GM_cookie.list(details, (cookies, error) => {
                    if (error) done([]);
                    else done(cookies);
                });
                if (result && typeof result.then === 'function') result.then(done).catch(() => done([]));
                setTimeout(() => done([]), 3500);
            } catch (_) { done([]); }
        });
    }

    function normalizeCookie(cookie, fallbackDomain) {
        let domain = String(cookie.domain || fallbackDomain || HOST);
        if (/^(open\.)?spotify\.com$/i.test(domain)) domain = '.spotify.com';
        if (/^(www\.)?deezer\.com$/i.test(domain)) domain = '.deezer.com';
        if (/^(www\.)?youtube\.com$/i.test(domain)) domain = '.youtube.com';
        if (/^(www\.)?soundcloud\.com$/i.test(domain)) domain = '.soundcloud.com';
        return {
            domain,
            includeSubdomains: domain.startsWith('.'),
            path: String(cookie.path || '/'),
            secure: cookie.secure !== undefined ? Boolean(cookie.secure) : true,
            expiry: Math.max(0, Math.floor(Number(cookie.expirationDate || cookie.expiry || 0))),
            name: String(cookie.name || ''),
            value: String(cookie.value || '')
        };
    }

    function documentCookies(domain) {
        const rows = [];
        try {
            for (const pair of document.cookie.split(';')) {
                const index = pair.indexOf('=');
                if (index < 1) continue;
                const name = pair.slice(0, index).trim();
                const val = pair.slice(index + 1).trim();
                rows.push(normalizeCookie({ name, value: val, domain, secure: location.protocol === 'https:' }, domain));
            }
        } catch (_) {}
        return rows;
    }

    async function scanCookies() {
        if (!PLATFORM) return;
        if (PLATFORM === 'deezer') inspectDeezerAppState();
        const queries = cookieDomains().map(domain => ({ domain }));
        let targetedCookies = [];
        if (PLATFORM === 'deezer') {
            const results = await Promise.all([
                gmCookieList({}),
                gmCookieList({ url: location.href }),
                gmCookieList({ url: location.origin }),
                gmCookieList({ url: 'https://www.deezer.com/' }),
                gmCookieList({ url: 'https://deezer.com/' }),
                gmCookieList({ name: 'arl' }),
                gmCookieList({ domain: '.deezer.com' }),
                gmCookieList({ domain: 'www.deezer.com' }),
                gmCookieList({ domain: 'deezer.com' })
            ]);
            targetedCookies = results.flat();
        } else if (PLATFORM === 'spotify') {
            const results = await Promise.all([
                gmCookieList({}),
                gmCookieList({ url: 'https://open.spotify.com/' }),
                gmCookieList({ domain: '.spotify.com' }),
                gmCookieList({ name: 'sp_dc' }),
                gmCookieList({ name: 'sp_key' }),
                gmCookieList({ name: 'sp_t' })
            ]);
            targetedCookies = results.flat();
        } else if (PLATFORM === 'apple') {
            const results = await Promise.all([
                gmCookieList({ url: location.origin }),
                gmCookieList({ name: 'media-user-token' })
            ]);
            targetedCookies = results.flat();
        }

        const all = documentCookies(HOST);
        const attempted = new Set();
        for (const query of queries) {
            const signature = JSON.stringify(query);
            if (attempted.has(signature)) continue;
            attempted.add(signature);
            const remote = await gmCookieList(query);
            all.push(...remote.map(c => normalizeCookie(c, query.domain || HOST)));
        }
        all.push(...targetedCookies.map(c => normalizeCookie(c, HOST)));

        const unique = new Map();
        for (const cookie of all) {
            if (cookie.name && cookie.value) {
                unique.set([cookie.domain, cookie.path, cookie.name].join('\0'), cookie);
            }
        }
        state.cookies[PLATFORM] = Array.from(unique.values());
        persist('cookies');

        for (const cookie of all) {
            if (PLATFORM === 'deezer') {
                if (cookie.name.toLowerCase() === 'arl' && isValidDeezerArl(cookie.value)) {
                    put('DEEZER_TOKEN', cookie.value);
                } else if (cookie.name.toLowerCase() === 'sid' && cookie.value) {
                    remember('deezerSid', cookie.value);
                }
            }
            if (PLATFORM === 'apple' && cookie.name === 'media-user-token' && cookie.value) {
                put('APPLE_MEDIA_USER_TOKEN', cookie.value);
            }
            if (PLATFORM === 'spotify' && ['sp_dc', 'sp_key', 'sp_t'].includes(cookie.name) && cookie.value) {
                remember(cookie.name, cookie.value);
            }
            if (PLATFORM === 'soundcloud' && cookie.name === 'oauth_token' && cookie.value) {
                put('SOUNDCLOUD_OAUTH_TOKEN', cookie.value);
            }
        }
    }

    function cookieLine(cookie) {
        const clean = text => String(text === undefined ? '' : text).replace(/[\t\r\n]/g, '');
        const domain = clean(cookie.domain);
        const includeSubdomains = cookie.includeSubdomains !== undefined
            ? (cookie.includeSubdomains ? 'TRUE' : 'FALSE')
            : (domain.startsWith('.') ? 'TRUE' : 'FALSE');
        return [
            domain,
            includeSubdomains,
            clean(cookie.path || '/'),
            cookie.secure ? 'TRUE' : 'FALSE',
            Math.max(0, Math.floor(Number(cookie.expiry) || 0)),
            clean(cookie.name),
            clean(cookie.value)
        ].join('\t');
    }

    function netscapeFile(cookies, comment = 'Generated by DeadMoon Harvester V2.2') {
        const unique = new Map();
        for (const cookie of cookies) {
            if (cookie && cookie.name && cookie.value) {
                unique.set([cookie.domain, cookie.path, cookie.name].join('\0'), cookie);
            }
        }
        return (
            '# Netscape HTTP Cookie File\n' +
            '# ' + comment + '\n\n' +
            Array.from(unique.values()).map(cookieLine).join('\n') +
            '\n'
        );
    }

    // ============================================================================
    // V3 RESOURCE FILE EXPORTERS (tidal_config.toml, qobuz_config.toml, cookies)
    // ============================================================================
    function exportTidalConfigToml() {
        const fields = resolvedTidalFields();
        if (!fields.user_id || !fields.access_token || !fields.refresh_token) {
            throw new Error('Missing Tidal credentials (user_id, access_token, and refresh_token required).');
        }
        return [
            '[tidal]',
            '',
            `user_id = ${JSON.stringify(fields.user_id)}`,
            `token_type = "Bearer"`,
            `access_token = ${JSON.stringify(fields.access_token)}`,
            `refresh_token = ${JSON.stringify(fields.refresh_token)}`,
            `token_expiry = ${JSON.stringify(fields.token_expiry)}`,
            `country_code = ${JSON.stringify(fields.country_code)}`,
            ''
        ].join('\n');
    }

    function exportQobuzConfigToml() {
        if (!isPlatformReady('qobuz')) {
            throw new Error('Missing Qobuz credentials. Capture user_id/token or email/password + app_id/secrets first.');
        }
        const authToken = value('QOBUZ_USER_AUTH_TOKEN').trim();
        const userId = value('QOBUZ_USER_ID').trim();
        const email = value('QOBUZ_EMAIL').trim();
        const rawPass = value('QOBUZ_PASSWORD').trim();
        const appId = value('QOBUZ_APP_ID').trim();
        const secretsList = value('QOBUZ_SECRETS').split(',').map(s => s.trim()).filter(Boolean);

        const useAuthToken = Boolean(authToken);
        const emailOrUserId = useAuthToken ? (userId || email) : (email || userId);
        let passwordOrToken = authToken;
        if (!useAuthToken && rawPass) {
            passwordOrToken = /^[0-9a-fA-F]{32}$/.test(rawPass) ? rawPass.toLowerCase() : md5Hex(rawPass);
        }

        return [
            '[qobuz]',
            '',
            `use_auth_token = ${useAuthToken ? 'true' : 'false'}`,
            `email_or_userid = ${JSON.stringify(String(emailOrUserId || ''))}`,
            `password_or_token = ${JSON.stringify(String(passwordOrToken || ''))}`,
            `app_id = ${JSON.stringify(String(appId || ''))}`,
            `secrets = [${secretsList.map(s => JSON.stringify(s)).join(', ')}]`,
            ''
        ].join('\n');
    }

    function exportAppleCookiesTxt() {
        const token = value('APPLE_MEDIA_USER_TOKEN').trim();
        const extraCookies = (state.cookies.apple || []).filter(c => c.name && c.name !== 'media-user-token');
        if (!token && !extraCookies.length) {
            throw new Error('Missing Apple Music media-user-token or cookies.');
        }
        const lines = [
            '# Netscape HTTP Cookie File',
            '# Generated by DeadMoon /authenticateapple'
        ];
        if (token) {
            lines.push(`.apple.com\tTRUE\t/\tTRUE\t0\tmedia-user-token\t${token}`);
            lines.push(`music.apple.com\tFALSE\t/\tTRUE\t0\tmedia-user-token\t${token}`);
            lines.push(`.music.apple.com\tTRUE\t/\tTRUE\t0\tmedia-user-token\t${token}`);
        }
        for (const c of extraCookies) {
            lines.push(cookieLine(c));
        }
        return lines.join('\n') + '\n';
    }

    function spotifyCookiesList() {
        const list = (state.cookies.spotify || []).map(c => normalizeCookie(c, '.spotify.com'));
        for (const name of ['sp_dc', 'sp_key', 'sp_t']) {
            const val = state.metadata[name];
            if (val) {
                const entry = {
                    domain: '.spotify.com',
                    includeSubdomains: true,
                    path: '/',
                    secure: true,
                    expiry: 0,
                    name,
                    value: String(val).trim()
                };
                const idx = list.findIndex(c => c.name === name && c.domain === '.spotify.com');
                if (idx >= 0) list[idx] = Object.assign({}, list[idx], entry);
                else list.unshift(entry);
            }
        }
        return list;
    }

    function exportSpotifyCookiesTxt() {
        const spDc = getSpotifySpDc();
        if (!spDc) throw new Error('Missing Spotify sp_dc cookie. Log in to open.spotify.com or paste sp_dc below.');
        return netscapeFile(spotifyCookiesList(), 'Generated by DeadMoon Harvester V2.2 for dotify-cli');
    }

    function exportSpotifyCredentialsJson() {
        const spDc = getSpotifySpDc();
        if (!spDc) throw new Error('Missing Spotify sp_dc cookie.');
        return JSON.stringify({
            _note: 'Optional legacy-path web-session adapter. Prefer spotify_cookies.txt.',
            sp_dc: spDc
        }, null, 2) + '\n';
    }

    function buildAuthenticateCommand(plat = PLATFORM) {
        if (plat === 'deezer') {
            const arl = value('DEEZER_TOKEN');
            if (!arl) throw new Error('Capture DEEZER_TOKEN first.');
            return `/authenticatedeezer ${arl}`;
        }
        if (plat === 'tidal') {
            updateTidalBlob();
            const blob = value('TIDAL_OAUTH_TOKEN');
            if (!blob) return '/authenticatetidal';
            return `/authenticatetidal ${blob}`;
        }
        if (plat === 'qobuz') {
            const uid = value('QOBUZ_USER_ID');
            const token = value('QOBUZ_USER_AUTH_TOKEN');
            const email = value('QOBUZ_EMAIL');
            const pass = value('QOBUZ_PASSWORD');
            const appId = value('QOBUZ_APP_ID');
            const secrets = value('QOBUZ_SECRETS');
            if (uid && token) {
                return `/authenticateqobuz ${uid} ${token}` + (appId ? ` ${appId}` : '') + (secrets ? ` ${secrets}` : '');
            }
            if (email && pass) {
                return `/authenticateqobuz ${email} ${pass}`;
            }
            throw new Error('Capture Qobuz user_id + token or email + password first.');
        }
        if (plat === 'apple') {
            const mut = value('APPLE_MEDIA_USER_TOKEN');
            if (!mut) throw new Error('Capture APPLE_MEDIA_USER_TOKEN first.');
            return `/authenticateapple ${mut}`;
        }
        if (plat === 'soundcloud') {
            const sc = value('SOUNDCLOUD_OAUTH_TOKEN');
            if (!sc) throw new Error('Capture SOUNDCLOUD_OAUTH_TOKEN first.');
            return `/authenticatesoundcloud ${sc}`;
        }
        throw new Error('No /authenticate command for this platform.');
    }

    function exportStandaloneJson() {
        updateTidalBlob();
        const tidalFields = resolvedTidalFields();
        const payload = {
            exported_at: new Date().toISOString(),
            platform: PLATFORM,
            deezer: {
                arl: value('DEEZER_TOKEN'),
                email: value('DEEZER_USERNAME'),
                user_id: state.metadata.deezerUserId || '',
                sid: state.metadata.deezerSid || ''
            },
            tidal: {
                user_id: tidalFields.user_id,
                token_type: 'Bearer',
                access_token: tidalFields.access_token,
                refresh_token: tidalFields.refresh_token,
                token_expiry: tidalFields.token_expiry,
                country_code: tidalFields.country_code,
                client_id: state.metadata.tidalClientId || jwtClientId(tidalFields.access_token)
            },
            qobuz: {
                user_id: value('QOBUZ_USER_ID'),
                user_auth_token: value('QOBUZ_USER_AUTH_TOKEN'),
                email: value('QOBUZ_EMAIL'),
                app_id: value('QOBUZ_APP_ID'),
                secrets: value('QOBUZ_SECRETS').split(',').filter(Boolean)
            },
            spotify: {
                sp_dc: getSpotifySpDc(),
                sp_key: state.metadata.sp_key || '',
                sp_t: state.metadata.sp_t || '',
                oauth_token: value('SPOTIFY_OAUTH_TOKEN'),
                username: state.metadata.spotifyUsername || ''
            },
            apple: {
                media_user_token: value('APPLE_MEDIA_USER_TOKEN'),
                developer_token: state.metadata.appleDeveloperToken || '',
                storefront: state.metadata.appleStorefront || ''
            },
            amazon: safeParse(value('AMAZON_DEVICE_TOKEN')) || {},
            soundcloud: {
                oauth_token: value('SOUNDCLOUD_OAUTH_TOKEN')
            },
            telegram: {
                bot_token: value('TELEGRAM_TOKEN'),
                admin_id: value('ADMIN_ID')
            },
            widevine_wvd_bytes: wvdBytes() ? wvdBytes().length : 0
        };
        return JSON.stringify(payload, null, 2) + '\n';
    }

    function gmRequest(details) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'function') { reject(new Error('GM_xmlhttpRequest is unavailable')); return; }
            try {
                GM_xmlhttpRequest(Object.assign({ method: 'GET', timeout: 20000 }, details, {
                    onload: response => response.status >= 200 && response.status < 400 ? resolve(response) : reject(new Error('HTTP ' + response.status)),
                    onerror: () => reject(new Error('Network request failed')),
                    ontimeout: () => reject(new Error('Network request timed out'))
                }));
            } catch (error) { reject(error); }
        });
    }

    function decodeBase64Text(text) {
        const normalized = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
        const bytes = Uint8Array.from(atob(normalized), c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    function extractQobuzBundle(bundle) {
        const pairs = new Map();
        const seedPattern = /[a-z]\.initialSeed\("(?<seed>[\w=]+)",window\.utimezone\.(?<timezone>[a-z]+)\)/g;
        for (const match of bundle.matchAll(seedPattern)) pairs.set(match.groups.timezone, [match.groups.seed]);
        const keypairs = Array.from(pairs.entries());
        if (keypairs.length > 1) pairs.delete(keypairs[1][0]);
        const ordered = keypairs.length > 1 ? [keypairs[1], ...keypairs.filter((_, index) => index !== 1)] : keypairs;
        pairs.clear();
        for (const [timezone, parts] of ordered) pairs.set(timezone, parts);
        const timezones = ordered.map(([timezone]) => timezone.charAt(0).toUpperCase() + timezone.slice(1));
        if (timezones.length) {
            const infoPattern = new RegExp('name:"\\w+/(?<timezone>' + timezones.join('|') + ')",info:"(?<info>[\\w=]+)",extras:"(?<extras>[\\w=]+)"', 'g');
            for (const match of bundle.matchAll(infoPattern)) {
                const key = match.groups.timezone.toLowerCase();
                if (pairs.has(key)) pairs.get(key).push(match.groups.info, match.groups.extras);
            }
        }
        const secrets = [];
        for (const parts of pairs.values()) {
            if (parts.length !== 3) continue;
            try {
                const secret = decodeBase64Text(parts.join('').slice(0, -44));
                if (secret) secrets.push(secret);
            } catch (_) {}
        }
        const appMatch = bundle.match(/production:\{api:\{appId:"(?<appId>\d{9})",appSecret:"(?:\w{32})/);
        return { appId: appMatch ? appMatch.groups.appId : '', secrets };
    }

    async function harvestQobuzBundle() {
        if (state.qobuzBusy) return;
        state.qobuzBusy = true;
        toast('🌒 Searching active Qobuz bundle.js for app_id & secrets…');
        try {
            const scripts = Array.from(document.scripts).map(s => s.src).filter(src => src && /(^|\.)qobuz\.com\//.test(new URL(src, location.href).hostname) && /(?:bundle|app|main).*\.js(?:\?|$)/i.test(src));
            const page = document.documentElement ? document.documentElement.innerHTML : '';
            for (const match of page.matchAll(/(?:https?:)?\/\/[^\s"'<>]+\.qobuz\.com\/[^\s"'<>]+\.js(?:\?[^\s"'<>]*)?/g)) {
                if (/bundle/i.test(match[0])) scripts.push(new URL(match[0], location.href).href);
            }
            const urls = Array.from(new Set(scripts));
            if (!urls.length) throw new Error('No Qobuz bundle script is loaded. Open play.qobuz.com, then retry.');
            const allSecrets = new Set(value('QOBUZ_SECRETS').split(',').filter(Boolean));
            let inspected = 0;
            for (const url of urls.slice(0, 8)) {
                try {
                    const response = await gmRequest({ url, responseType: 'text' });
                    inspected++;
                    const extracted = extractQobuzBundle(response.responseText);
                    put('QOBUZ_APP_ID', extracted.appId);
                    for (const secret of extracted.secrets) allSecrets.add(secret);
                } catch (_) {}
            }
            if (!allSecrets.size) throw new Error('No bundle secret found in ' + inspected + ' script(s).');
            put('QOBUZ_SECRETS', Array.from(allSecrets).join(','));
            toast('🌕 Qobuz app_id & secrets extracted!');
        } catch (error) {
            toast('🌑 ' + error.message);
        } finally {
            state.qobuzBusy = false;
            scheduleRefresh();
        }
    }

    function inspectDeezerAppState() {
        for (const appState of [window.__DZR_APP_STATE__, PAGE.__DZR_APP_STATE__]) {
            if (!appState) continue;
            try {
                parseDeezerPayload(appState);
            } catch (_) {}
        }
        try {
            for (const script of document.querySelectorAll('script')) {
                const text = script.textContent || '';
                if (!text || text.length > 500_000) continue;
                if (text.includes('__DZR_APP_STATE__') || text.includes('"checkForm"') || text.includes('"arl"')) {
                    const checkMatch = /"checkForm"\s*:\s*"([^"]+)"/.exec(text);
                    if (checkMatch) remember('deezerCheckForm', checkMatch[1]);
                    const emailMatch = /"EMAIL"\s*:\s*"([^"]+@[^"]+)"/.exec(text);
                    if (emailMatch) put('DEEZER_USERNAME', emailMatch[1]);
                    const arl = extractDeezerArlFromText(text);
                    if (isValidDeezerArl(arl)) put('DEEZER_TOKEN', arl);
                }
            }
        } catch (_) {}
    }

    function scanPageConfig() {
        try {
            if (PLATFORM === 'deezer') inspectDeezerAppState();
            if (PLATFORM === 'amazon' && PAGE.amznMusic && PAGE.amznMusic.appConfig) captureAmazonData(PAGE.amznMusic.appConfig);
            if (PLATFORM === 'spotify') {
                for (const selector of ['#session', '#__NEXT_DATA__', 'script[id*="session" i]']) {
                    for (const script of document.querySelectorAll(selector)) {
                        const data = safeParse(script.textContent);
                        if (!data) continue;
                        put('SPOTIFY_OAUTH_TOKEN', findField(data, ['accessToken', 'access_token']));
                        remember('spotifyUsername', findField(data, ['username', 'canonicalUserId']));
                    }
                }
            }
            if (PLATFORM === 'apple') {
                for (const script of document.querySelectorAll('script[type="application/json"], script#serialized-server-data')) {
                    const data = safeParse(script.textContent);
                    if (data) {
                        put('APPLE_MEDIA_USER_TOKEN', findField(data, ['mediaUserToken', 'media-user-token']));
                    }
                }
            }
        } catch (_) {}
    }

    function scanTelegramDom() {
        if (PLATFORM !== 'telegram' || !document.body) return;
        try {
            const selector = '.message, .text-content, .bubble, [class*="message" i], [class*="text-content" i]';
            for (const node of document.querySelectorAll(selector)) {
                const text = node.innerText || node.textContent || '';
                if (!/@BotFather|Use this token|token to access the HTTP API/i.test(text)) continue;
                const match = text.match(/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/);
                if (match) { put('TELEGRAM_TOKEN', match[0]); break; }
            }
        } catch (_) {}
    }

    function validateWvd(bytes) {
        if (!(bytes instanceof Uint8Array) || bytes.length < 11 || String.fromCharCode(...bytes.slice(0, 3)) !== 'WVD') {
            throw new Error('Not a pywidevine WVD file (missing WVD header).');
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const privateLength = view.getUint16(5, false);
        const clientOffset = 7 + privateLength;
        if (clientOffset + 2 > bytes.length) throw new Error('Truncated WVD private key.');
        const clientLength = view.getUint16(clientOffset, false);
        if (clientOffset + 2 + clientLength !== bytes.length) throw new Error('Invalid WVD field lengths.');
        return { version: bytes[3], privateLength, clientLength };
    }

    function derLength(length) {
        if (length < 128) return Uint8Array.of(length);
        const bytes = [];
        while (length) { bytes.unshift(length & 255); length >>>= 8; }
        return Uint8Array.of(0x80 | bytes.length, ...bytes);
    }

    function derWrap(tag, content) {
        const length = derLength(content.length);
        const result = new Uint8Array(1 + length.length + content.length);
        result[0] = tag; result.set(length, 1); result.set(content, 1 + length.length);
        return result;
    }

    function concatBytes(...arrays) {
        const result = new Uint8Array(arrays.reduce((sum, array) => sum + array.length, 0));
        let offset = 0;
        for (const array of arrays) { result.set(array, offset); offset += array.length; }
        return result;
    }

    async function pemToBytes(pem) {
        const clean = pem.replace(/\r/g, '').trim();
        const match = clean.match(/-----BEGIN (RSA )?PRIVATE KEY-----([\s\S]+?)-----END (?:RSA )?PRIVATE KEY-----/);
        if (!match) throw new Error('private_key.pem does not contain a PEM private key.');
        let der;
        try { der = base64ToBytes(match[2].replace(/\s/g, '')); }
        catch (_) { throw new Error('The PEM private key has invalid base64 data.'); }
        if (match[1]) {
            const algorithm = Uint8Array.from([0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00]);
            der = derWrap(0x30, concatBytes(Uint8Array.of(2, 1, 0), algorithm, derWrap(0x04, der)));
        }
        try {
            const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']);
            return new Uint8Array(await crypto.subtle.exportKey('pkcs8', key));
        } catch (_) { throw new Error('The private key is not a valid RSA PKCS#1/PKCS#8 key.'); }
    }

    function packWvd(clientId, privateKeyDer) {
        if (!(clientId instanceof Uint8Array) || !clientId.length || clientId.length > 65535) throw new Error('client_id.bin must contain 1–65535 bytes.');
        if (!(privateKeyDer instanceof Uint8Array) || !privateKeyDer.length || privateKeyDer.length > 65535) throw new Error('Private key must contain 1–65535 bytes.');
        const result = new Uint8Array(9 + privateKeyDer.length + clientId.length);
        result.set([0x57, 0x56, 0x44, 2, 1, 3, 0]);
        const view = new DataView(result.buffer);
        view.setUint16(5, privateKeyDer.length, false);
        result.set(privateKeyDer, 7);
        view.setUint16(7 + privateKeyDer.length, clientId.length, false);
        result.set(clientId, 9 + privateKeyDer.length);
        validateWvd(result);
        return result;
    }

    async function readFileBytes(file) {
        return new Uint8Array(await file.arrayBuffer());
    }

    async function importWvdFiles(files) {
        try {
            const list = Array.from(files || []);
            const wvd = list.find(file => /\.wvd$/i.test(file.name));
            let bytes;
            if (wvd) {
                bytes = await readFileBytes(wvd);
                validateWvd(bytes);
            } else {
                const clientFile = list.find(file => /client_id\.bin$/i.test(file.name));
                const keyFile = list.find(file => /private_key\.pem$/i.test(file.name));
                if (!clientFile || !keyFile) throw new Error('Choose device.wvd, or both client_id.bin and private_key.pem.');
                bytes = packWvd(await readFileBytes(clientFile), await pemToBytes(await keyFile.text()));
            }
            remember('wvdBase64', bytesToBase64(bytes));
            put('SPOTIFY_WVD_PATH', '/usr/src/app/local_resources/device.wvd');
            put('AMAZON_WVD_PATH', '/usr/src/app/local_resources/device.wvd');
            toast('🌕 Widevine device.wvd validated & stored (' + bytes.length + ' bytes).');
        } catch (error) {
            toast('🌑 ' + error.message);
        }
    }

    function wvdBytes() {
        try { return state.metadata.wvdBase64 ? base64ToBytes(state.metadata.wvdBase64) : null; }
        catch (_) { return null; }
    }

    // ============================================================================
    // DEADMOON_DOWNLOAD_BOT V3 68-KEY TOKEN.ENV GENERATOR
    // ============================================================================
    function template() {
        return `# DeadMoon Download Bot — live configuration
#
# Copy to \`token.env\` and fill in the values you need. \`token.env\` holds
# credentials, is listed in .gitignore, and must never be committed.

# ============================================================================
# Telegram
# ============================================================================
TELEGRAM_TOKEN={{TELEGRAM_TOKEN}}
BOT_LANG={{BOT_LANG}}
ADMIN_ID={{ADMIN_ID}}

# ============================================================================
# Platform switches
# ============================================================================
DEEZER_ENABLED={{DEEZER_ENABLED}}
QOBUZ_ENABLED={{QOBUZ_ENABLED}}
TIDAL_ENABLED={{TIDAL_ENABLED}}
AMAZON_ENABLED={{AMAZON_ENABLED}}
SPOTIFY_ENABLED={{SPOTIFY_ENABLED}}
APPLE_ENABLED={{APPLE_ENABLED}}
YOUTUBE_ENABLED={{YOUTUBE_ENABLED}}
SOUNDCLOUD_ENABLED={{SOUNDCLOUD_ENABLED}}

# ============================================================================
# Artist discography downloads
# ============================================================================
DEEZER_ARTIST_DOWNLOAD_ENABLED={{DEEZER_ARTIST_DOWNLOAD_ENABLED}}
QOBUZ_ARTIST_DOWNLOAD_ENABLED={{QOBUZ_ARTIST_DOWNLOAD_ENABLED}}
TIDAL_ARTIST_DOWNLOAD_ENABLED={{TIDAL_ARTIST_DOWNLOAD_ENABLED}}
AMAZON_ARTIST_DOWNLOAD_ENABLED={{AMAZON_ARTIST_DOWNLOAD_ENABLED}}
SPOTIFY_ARTIST_DOWNLOAD_ENABLED={{SPOTIFY_ARTIST_DOWNLOAD_ENABLED}}
APPLE_ARTIST_DOWNLOAD_ENABLED={{APPLE_ARTIST_DOWNLOAD_ENABLED}}
YOUTUBE_ARTIST_DOWNLOAD_ENABLED={{YOUTUBE_ARTIST_DOWNLOAD_ENABLED}}
SOUNDCLOUD_ARTIST_DOWNLOAD_ENABLED={{SOUNDCLOUD_ARTIST_DOWNLOAD_ENABLED}}

# ============================================================================
# Cross-platform Deezer ARL fallback
# ============================================================================
FALLBACK_ENABLED={{FALLBACK_ENABLED}}

# ============================================================================
# Deezer credentials
# ============================================================================
DEEZER_TOKEN={{DEEZER_TOKEN}}
DEEZER_USERNAME={{DEEZER_USERNAME}}
DEEZER_PASSWORD={{DEEZER_PASSWORD}}
DEEZER_PROXY={{DEEZER_PROXY}}
DEEZER_SESSION_REINIT_THRESHOLD={{DEEZER_SESSION_REINIT_THRESHOLD}}

# ============================================================================
# Qobuz credentials (streamrip — offloaded to local_resources/qobuz_config.toml)
# ============================================================================
QOBUZ_CONFIG_PATH={{QOBUZ_CONFIG_PATH}}
QOBUZ_USER_AUTH_TOKEN={{QOBUZ_USER_AUTH_TOKEN}}
QOBUZ_APP_ID={{QOBUZ_APP_ID}}
QOBUZ_USER_ID={{QOBUZ_USER_ID}}
QOBUZ_SECRETS={{QOBUZ_SECRETS}}
QOBUZ_EMAIL={{QOBUZ_EMAIL}}
QOBUZ_PASSWORD={{QOBUZ_PASSWORD}}

# ============================================================================
# Tidal credentials (streamrip — offloaded to local_resources/tidal_config.toml)
# ============================================================================
TIDAL_CONFIG_PATH={{TIDAL_CONFIG_PATH}}
TIDAL_USER_ID={{TIDAL_USER_ID}}
TIDAL_ACCESS_TOKEN={{TIDAL_ACCESS_TOKEN}}
TIDAL_REFRESH_TOKEN={{TIDAL_REFRESH_TOKEN}}
TIDAL_TOKEN_EXPIRY={{TIDAL_TOKEN_EXPIRY}}
TIDAL_OAUTH_TOKEN={{TIDAL_OAUTH_TOKEN}}
TIDAL_COUNTRY_CODE={{TIDAL_COUNTRY_CODE}}
TIDAL_CUSTOM_API={{TIDAL_CUSTOM_API}}

# ============================================================================
# Spotify credentials (dotify-cli / direct web Widevine)
# ============================================================================
SPOTIFY_COOKIES_PATH={{SPOTIFY_COOKIES_PATH}}
SPOTIFY_WVD_PATH={{SPOTIFY_WVD_PATH}}
SPOTIFY_CREDENTIALS_PATH={{SPOTIFY_CREDENTIALS_PATH}}
SPOTIFY_OAUTH_TOKEN={{SPOTIFY_OAUTH_TOKEN}}
SPOTIFY_AUDIO_QUALITY={{SPOTIFY_AUDIO_QUALITY}}
SPOTIFY_BULK_WAIT_SECONDS={{SPOTIFY_BULK_WAIT_SECONDS}}

# ============================================================================
# Apple Music credentials (gamdl — offloaded to local_resources/apple_cookies.txt)
# ============================================================================
APPLE_COOKIES_PATH={{APPLE_COOKIES_PATH}}
APPLE_MEDIA_USER_TOKEN={{APPLE_MEDIA_USER_TOKEN}}
APPLE_CODEC_PRIORITY={{APPLE_CODEC_PRIORITY}}

# ============================================================================
# Amazon Music credentials
# ============================================================================
AMAZON_DEVICE_TOKEN={{AMAZON_DEVICE_TOKEN}}
AMAZON_WVD_PATH={{AMAZON_WVD_PATH}}
AMAZON_CLI={{AMAZON_CLI}}

# ============================================================================
# Quality & output
# ============================================================================
ENABLE_FLAC={{ENABLE_FLAC}}
FORMAT={{FORMAT}}
MAX_RETRIES={{MAX_RETRIES}}
SEND_ALBUM_COVER={{SEND_ALBUM_COVER}}
ENGINE_TIMEOUT_SECONDS={{ENGINE_TIMEOUT_SECONDS}}
STREAMRIP_MAX_CONNECTIONS={{STREAMRIP_MAX_CONNECTIONS}}

# ============================================================================
# Concurrency
# ============================================================================
MAX_CONCURRENT_DOWNLOADS={{MAX_CONCURRENT_DOWNLOADS}}
MAX_QUEUED_DOWNLOADS={{MAX_QUEUED_DOWNLOADS}}

# ============================================================================
# Artist download limits
# ============================================================================
MAX_ARTIST_RELEASES={{MAX_ARTIST_RELEASES}}
ARTIST_API_DELAY={{ARTIST_API_DELAY}}

# ============================================================================
# File hosting
# ============================================================================
COPY_FILES_PATH={{COPY_FILES_PATH}}
FILE_LINK_TEMPLATE={{FILE_LINK_TEMPLATE}}
COOKIES_PATH={{COOKIES_PATH}}

# ============================================================================
# SoundCloud
# ============================================================================
SOUNDCLOUD_OAUTH_TOKEN={{SOUNDCLOUD_OAUTH_TOKEN}}

# ============================================================================
# Auto-delete
# ============================================================================
AUTO_DELETE_ENABLED={{AUTO_DELETE_ENABLED}}
AUTO_DELETE_SECONDS={{AUTO_DELETE_SECONDS}}
`;
    }

    const OFFLOADED_INLINE_KEYS = new Set([
        'TIDAL_USER_ID', 'TIDAL_ACCESS_TOKEN', 'TIDAL_REFRESH_TOKEN', 'TIDAL_TOKEN_EXPIRY', 'TIDAL_OAUTH_TOKEN',
        'QOBUZ_USER_AUTH_TOKEN', 'QOBUZ_APP_ID', 'QOBUZ_USER_ID', 'QOBUZ_SECRETS', 'QOBUZ_EMAIL', 'QOBUZ_PASSWORD',
        'APPLE_MEDIA_USER_TOKEN'
    ]);

    function dotEnvValue(val) {
        return String(val === undefined || val === null ? '' : val).replace(/[\r\n\0]/g, '').trim();
    }

    function buildEnv() {
        updateTidalBlob();
        return template().replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
            if (!state.inlineOffloadedSecrets && OFFLOADED_INLINE_KEYS.has(key)) {
                return '';
            }
            return dotEnvValue(value(key));
        });
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }

    function copyText(text, message = '🌕 Copied to clipboard.') {
        try {
            if (typeof GM_setClipboard === 'function') GM_setClipboard(text, 'text');
            else if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
            else fallbackCopy(text);
            toast(message);
        } catch (_) { fallbackCopy(text); toast(message); }
    }

    function fallbackCopy(text) {
        const area = document.createElement('textarea');
        area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.documentElement.appendChild(area); area.select();
        try { document.execCommand('copy'); } catch (_) {}
        area.remove();
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        try {
            if (typeof GM_download === 'function') {
                let timer;
                GM_download({
                    url, name: filename, saveAs: true,
                    onerror: () => { clearTimeout(timer); anchorDownload(url, filename); },
                    ontimeout: () => { clearTimeout(timer); anchorDownload(url, filename); }
                });
                timer = setTimeout(() => URL.revokeObjectURL(url), 60000);
            } else {
                anchorDownload(url, filename);
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            }
        } catch (_) {
            anchorDownload(url, filename);
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
    }

    function anchorDownload(url, filename) {
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = filename; anchor.style.display = 'none';
        document.documentElement.appendChild(anchor); anchor.click(); anchor.remove();
    }

    function downloadText(text, filename, type = 'text/plain;charset=utf-8') {
        downloadBlob(new Blob([text], { type }), filename);
    }

    function downloadWvd() {
        const bytes = wvdBytes();
        if (!bytes) { toast('🌑 Import a device.wvd or client_id.bin + private_key.pem first.'); return; }
        downloadBlob(new Blob([bytes], { type: 'application/octet-stream' }), 'device.wvd');
        put('SPOTIFY_WVD_PATH', '/usr/src/app/local_resources/device.wvd');
        put('AMAZON_WVD_PATH', '/usr/src/app/local_resources/device.wvd');
    }

    function exportSiteFile() {
        if (PLATFORM === 'tidal') {
            downloadText(exportTidalConfigToml(), 'tidal_config.toml');
            put('TIDAL_CONFIG_PATH', '/usr/src/app/local_resources/tidal_config.toml');
            toast('📦 Downloaded tidal_config.toml for local_resources/');
        } else if (PLATFORM === 'qobuz') {
            downloadText(exportQobuzConfigToml(), 'qobuz_config.toml');
            put('QOBUZ_CONFIG_PATH', '/usr/src/app/local_resources/qobuz_config.toml');
            toast('📦 Downloaded qobuz_config.toml for local_resources/');
        } else if (PLATFORM === 'spotify') {
            downloadText(exportSpotifyCookiesTxt(), 'spotify_cookies.txt');
            put('SPOTIFY_COOKIES_PATH', '/usr/src/app/local_resources/spotify_cookies.txt');
            toast('📦 Downloaded spotify_cookies.txt for local_resources/');
        } else if (PLATFORM === 'apple') {
            downloadText(exportAppleCookiesTxt(), 'apple_cookies.txt');
            put('APPLE_COOKIES_PATH', '/usr/src/app/local_resources/apple_cookies.txt');
            toast('📦 Downloaded apple_cookies.txt for local_resources/');
        } else if (PLATFORM === 'youtube' || PLATFORM === 'soundcloud') {
            const social = [...(state.cookies.youtube || []), ...(state.cookies.soundcloud || [])];
            if (!social.length) throw new Error('No YouTube/SoundCloud cookies captured yet.');
            downloadText(netscapeFile(social, 'Exported YouTube/SoundCloud cookies for yt-dlp'), 'cookies.txt');
            put('COOKIES_PATH', '/usr/src/app/local_resources/cookies.txt');
            toast('📦 Downloaded cookies.txt for local_resources/');
        } else if (PLATFORM === 'amazon') {
            downloadWvd();
        } else {
            toast('🌓 Use the export buttons below for this site.');
        }
    }

    async function exportAllFiles() {
        await scanCookies();
        const downloaded = [];
        if (isPlatformReady('tidal')) {
            downloadText(exportTidalConfigToml(), 'tidal_config.toml');
            put('TIDAL_CONFIG_PATH', '/usr/src/app/local_resources/tidal_config.toml');
            downloaded.push('tidal_config.toml');
        }
        if (isPlatformReady('qobuz')) {
            downloadText(exportQobuzConfigToml(), 'qobuz_config.toml');
            put('QOBUZ_CONFIG_PATH', '/usr/src/app/local_resources/qobuz_config.toml');
            downloaded.push('qobuz_config.toml');
        }
        if (getSpotifySpDc()) {
            downloadText(exportSpotifyCookiesTxt(), 'spotify_cookies.txt');
            put('SPOTIFY_COOKIES_PATH', '/usr/src/app/local_resources/spotify_cookies.txt');
            downloaded.push('spotify_cookies.txt');
        }
        if (value('APPLE_MEDIA_USER_TOKEN') || (state.cookies.apple || []).length) {
            downloadText(exportAppleCookiesTxt(), 'apple_cookies.txt');
            put('APPLE_COOKIES_PATH', '/usr/src/app/local_resources/apple_cookies.txt');
            downloaded.push('apple_cookies.txt');
        }
        const social = [...(state.cookies.youtube || []), ...(state.cookies.soundcloud || [])];
        if (social.length) {
            downloadText(netscapeFile(social, 'Exported YouTube/SoundCloud cookies for yt-dlp'), 'cookies.txt');
            put('COOKIES_PATH', '/usr/src/app/local_resources/cookies.txt');
            downloaded.push('cookies.txt');
        }
        if (wvdBytes()) {
            downloadBlob(new Blob([wvdBytes()], { type: 'application/octet-stream' }), 'device.wvd');
            downloaded.push('device.wvd');
        }
        toast(downloaded.length ? '📦 Downloaded local_resources: ' + downloaded.join(', ') : '🌑 No local_resources files ready yet.');
    }

    function clearStoredCredentials() {
        if (!PAGE.confirm('🌑 Delete every DeadMoon credential, cookie, and WVD from Tampermonkey storage?')) return;
        try {
            for (const key of GM_listValues()) {
                if (key.startsWith(PREFIX) || key.startsWith(V3_LEGACY_PREFIX) || key.startsWith(V1_LEGACY_PREFIX)) {
                    GM_deleteValue(key);
                }
            }
        } catch (_) {}
        state.values = {}; state.cookies = {}; state.metadata = {}; state.widevine = [];
        loadState();
        scheduleRefresh();
        toast('🌑 Stored DeadMoon data cleared.');
    }

    const HUD_CSS = `
:host { all: initial; --bg:#0c0f14; --panel:#131822; --line:#263042; --text:#eef2f8; --muted:#919eb3; --accent:#bdff58; --purple:#b48eff; --cyan:#5ce1e6; --yellow:#ffd166; --green:#79ef8c; }
* { box-sizing:border-box; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
#shell { position:fixed; z-index:2147483647; right:18px; bottom:18px; width:min(620px,calc(100vw - 24px)); color:var(--text); font-size:13px; line-height:1.4; filter:drop-shadow(0 16px 40px #000c); }
#panel { background:var(--bg); border:1px solid #354156; border-radius:16px; overflow:hidden; }
#handle { min-height:54px; display:flex; align-items:center; gap:10px; padding:10px 14px; background:linear-gradient(135deg,#182030,#0f141d); cursor:move; user-select:none; border-bottom:1px solid #232c3d; }
#handle:hover { background:linear-gradient(135deg,#1e283b,#131924); }
.dot { width:10px; height:10px; flex:0 0 10px; border-radius:50%; background:#7c8794; box-shadow:0 0 10px currentColor; }
.dot.green { background:var(--green); color:var(--green); } .dot.yellow { background:var(--yellow); color:var(--yellow); }
.brand { font-weight:800; letter-spacing:.3px; color:#fff; } .sub { color:var(--muted); font-size:11px; }
.grow { flex:1; min-width:0; } button,select,input,textarea { font:inherit; }
button { color:var(--text); background:#1f2735; border:1px solid #364358; border-radius:8px; padding:7px 10px; cursor:pointer; transition:.14s; }
button:hover:not(:disabled) { background:#2b3648; border-color:#5b6d8a; }
button:disabled { opacity:.45; cursor:not-allowed; }
button.primary { color:#0e1605; background:var(--accent); border-color:var(--accent); font-weight:750; }
button.primary:hover:not(:disabled) { background:#d2ff8a; }
button.purple { color:#120b24; background:var(--purple); border-color:var(--purple); font-weight:750; }
button.purple:hover:not(:disabled) { background:#cab0ff; }
button.danger { color:#ff9d9d; }
.mode-pill { font-size:11px; padding:5px 9px; border-radius:999px; font-weight:700; border:1px solid #44536d; background:#171f2c; color:var(--cyan); }
.mode-pill.compat-on { border-color:var(--accent); color:var(--accent); background:#182414; }
#toggle { padding:5px 9px; font-size:17px; line-height:1; }
#tabs { display:flex; align-items:center; padding:10px 12px 0; gap:6px; background:#0e121a; border-bottom:1px solid var(--line); }
#tabs button { border-radius:8px 8px 0 0; border-bottom:0; color:var(--muted); background:transparent; }
#tabs button.active { color:var(--accent); background:var(--panel); border-color:var(--line); }
.content { max-height:min(68vh,660px); overflow:auto; padding:12px; background:var(--panel); }
.card { padding:11px; border:1px solid var(--line); border-radius:10px; margin-bottom:10px; background:#0e131b; }
.card h3 { margin:0 0 8px; font-size:13px; color:#fff; display:flex; align-items:center; gap:6px; }
.row { display:flex; align-items:center; gap:7px; margin:6px 0; flex-wrap:wrap; }
.key { flex:0 0 215px; font:11px ui-monospace,SFMono-Regular,Consolas,monospace; color:#c5d1e0; overflow-wrap:anywhere; }
.masked { flex:1; min-width:0; color:var(--muted); font:11px ui-monospace,SFMono-Regular,Consolas,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.small { font-size:11px; padding:5px 8px; } .muted { color:var(--muted); font-size:12px; } .notice { color:var(--yellow); font-size:12px; } .ok { color:var(--green); font-size:12px; }
input,select,textarea { width:100%; min-width:0; color:var(--text); background:#080b10; border:1px solid #313d50; border-radius:7px; padding:7px; }
input[type="checkbox"] { width:auto; accent-color:var(--accent); }
textarea { resize:vertical; min-height:120px; font:11px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre; }
textarea.env { min-height:290px; } label { display:block; color:var(--muted); font-size:11px; margin:7px 0 3px; }
.actions { display:flex; flex-wrap:wrap; gap:7px; padding:10px 12px; border-top:1px solid var(--line); background:#0b0f16; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 12px; }
.drop { border:1px dashed #5d6e87; padding:12px; text-align:center; border-radius:8px; color:var(--muted); cursor:pointer; }
.drop.over { border-color:var(--accent); color:var(--accent); } .hidden { display:none !important; }
#toast { position:absolute; left:12px; right:12px; bottom:12px; padding:10px 12px; border-radius:9px; background:#05070aee; border:1px solid #596982; color:#fff; transform:translateY(10px); opacity:0; pointer-events:none; transition:.18s; }
#toast.show { opacity:1; transform:translateY(0); } code { color:#d2c8ff; overflow-wrap:anywhere; }
`;

    let shadow, panel, handle, body, toastTimer;

    function siteKeys() {
        if (!state.compatMode) {
            const rawKeys = {
                deezer: ['DEEZER_TOKEN', 'DEEZER_USERNAME', 'DEEZER_PASSWORD'],
                qobuz: ['QOBUZ_USER_ID', 'QOBUZ_USER_AUTH_TOKEN', 'QOBUZ_APP_ID', 'QOBUZ_SECRETS', 'QOBUZ_EMAIL', 'QOBUZ_PASSWORD'],
                tidal: ['TIDAL_USER_ID', 'TIDAL_ACCESS_TOKEN', 'TIDAL_REFRESH_TOKEN', 'TIDAL_TOKEN_EXPIRY', 'TIDAL_COUNTRY_CODE'],
                spotify: ['SPOTIFY_OAUTH_TOKEN'],
                apple: ['APPLE_MEDIA_USER_TOKEN'],
                amazon: ['AMAZON_DEVICE_TOKEN'],
                soundcloud: ['SOUNDCLOUD_OAUTH_TOKEN'],
                youtube: [],
                telegram: ['TELEGRAM_TOKEN', 'ADMIN_ID']
            };
            return rawKeys[PLATFORM] || [];
        }
        const compatKeys = {
            deezer: ['DEEZER_TOKEN', 'DEEZER_USERNAME', 'DEEZER_PASSWORD', 'DEEZER_PROXY'],
            qobuz: ['QOBUZ_CONFIG_PATH', 'QOBUZ_USER_ID', 'QOBUZ_USER_AUTH_TOKEN', 'QOBUZ_APP_ID', 'QOBUZ_SECRETS', 'QOBUZ_EMAIL'],
            tidal: ['TIDAL_CONFIG_PATH', 'TIDAL_USER_ID', 'TIDAL_ACCESS_TOKEN', 'TIDAL_REFRESH_TOKEN', 'TIDAL_TOKEN_EXPIRY', 'TIDAL_COUNTRY_CODE'],
            spotify: ['SPOTIFY_COOKIES_PATH', 'SPOTIFY_WVD_PATH', 'SPOTIFY_CREDENTIALS_PATH', 'SPOTIFY_AUDIO_QUALITY', 'SPOTIFY_BULK_WAIT_SECONDS'],
            apple: ['APPLE_COOKIES_PATH', 'APPLE_MEDIA_USER_TOKEN', 'APPLE_CODEC_PRIORITY'],
            amazon: ['AMAZON_DEVICE_TOKEN', 'AMAZON_WVD_PATH', 'AMAZON_CLI'],
            soundcloud: ['SOUNDCLOUD_OAUTH_TOKEN', 'COOKIES_PATH'],
            youtube: ['COOKIES_PATH'],
            telegram: ['TELEGRAM_TOKEN', 'ADMIN_ID']
        };
        return compatKeys[PLATFORM] || [];
    }

    function captureStatus() {
        if (isPlatformReady(PLATFORM)) return 'green';
        if (isPlatformPartial(PLATFORM)) return 'yellow';
        return 'grey';
    }

    function completion() {
        const platforms = ['deezer', 'qobuz', 'tidal', 'spotify', 'apple', 'amazon', 'telegram'];
        const complete = platforms.filter(isPlatformReady).length;
        return { complete, total: platforms.length };
    }

    function mask(text) {
        const val = String(text || '');
        if (!val) return 'not captured';
        if (val.length < 9) return val;
        if (val.startsWith('/usr/src/app/')) return val;
        return val.slice(0, 6) + '••••••••' + val.slice(-4) + ' (' + val.length + ')';
    }

    function initHud() {
        if (!PLATFORM || state.hudReady || !document.documentElement) return;
        state.hudReady = true;

        const root = document.createElement('div');
        root.id = 'deadmoon-harvester-v2-root';
        shadow = root.attachShadow({ mode: 'closed' });
        const style = document.createElement('style');
        style.textContent = HUD_CSS;
        shadow.appendChild(style);
        const shell = document.createElement('div');
        shell.id = 'shell';
        shadow.appendChild(shell);
        shell.innerHTML = `
            <section id="panel">
                <div id="handle">
                    <span class="dot"></span>
                    <div class="grow">
                        <div class="brand"></div>
                        <div class="sub"></div>
                    </div>
                    <button class="mode-pill" data-action="toggle-compat" title="Toggle DeadMoon_Downloader V3 Compatibility Mode vs Standalone Extractor Mode"></button>
                    <button id="toggle" title="Expand or collapse">▴</button>
                </div>
                <div id="body">
                    <nav id="tabs"></nav>
                    <main class="content"></main>
                    <div class="actions" id="footer-actions"></div>
                </div>
                <div id="toast" role="status"></div>
            </section>`;
        document.documentElement.appendChild(root);
        panel = shadow.getElementById('panel');
        handle = shadow.getElementById('handle');
        body = shadow.getElementById('body');

        const savedPosition = gmGet('position', null);
        if (savedPosition && Number.isFinite(savedPosition.left) && Number.isFinite(savedPosition.top)) {
            shell.style.left = Math.max(0, Math.min(innerWidth - 80, savedPosition.left)) + 'px';
            shell.style.top = Math.max(0, Math.min(innerHeight - 52, savedPosition.top)) + 'px';
            shell.style.right = 'auto';
            shell.style.bottom = 'auto';
        }
        shadow.getElementById('toggle').addEventListener('click', event => {
            event.stopPropagation();
            state.collapsed = !state.collapsed;
            gmSet('collapsed', state.collapsed);
            render();
        });
        shadow.getElementById('tabs').addEventListener('click', event => {
            const tab = event.target.dataset.tab;
            if (tab) { state.tab = tab; render(); }
        });
        panel.addEventListener('click', handleAction);
        panel.addEventListener('change', handleChange);
        panel.addEventListener('input', handleLiveInput);
        panel.addEventListener('drop', event => {
            const drop = event.target.closest('.drop');
            if (!drop) return;
            event.preventDefault();
            event.stopPropagation();
            drop.classList.remove('over');
            Promise.resolve(importWvdFiles(event.dataTransfer.files)).catch(error => toast(error.message || String(error)));
        });
        panel.addEventListener('dragover', event => {
            if (event.target.closest('.drop')) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                event.target.closest('.drop').classList.add('over');
            }
        });
        panel.addEventListener('dragleave', event => {
            const drop = event.target.closest('.drop');
            if (drop) drop.classList.remove('over');
        });
        installDrag(shell);
        render();
    }

    function installDrag(shell) {
        let drag = null;
        handle.addEventListener('pointerdown', event => {
            if (event.target.closest('button')) return;
            const rect = shell.getBoundingClientRect();
            drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            shell.style.left = rect.left + 'px';
            shell.style.top = rect.top + 'px';
            shell.style.right = 'auto';
            shell.style.bottom = 'auto';
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        handle.addEventListener('pointermove', event => {
            if (!drag) return;
            shell.style.left = Math.max(0, Math.min(innerWidth - 70, event.clientX - drag.x)) + 'px';
            shell.style.top = Math.max(0, Math.min(innerHeight - 45, event.clientY - drag.y)) + 'px';
        });
        handle.addEventListener('pointerup', event => {
            if (!drag) return;
            drag = null;
            try { handle.releasePointerCapture(event.pointerId); } catch (_) {}
            gmSet('position', { left: parseFloat(shell.style.left), top: parseFloat(shell.style.top) });
        });
    }

    function render() {
        if (!state.hudReady) return;
        const status = captureStatus(), done = completion();
        const moonIcon = status === 'green' ? '🌕' : status === 'yellow' ? '🌓' : '🌑';
        panel.querySelector('.dot').className = 'dot ' + status;
        panel.querySelector('.brand').textContent = `${moonIcon} DeadMoon Harvester V2.2 · ${LABELS[PLATFORM] || HOST}`;
        panel.querySelector('.sub').textContent = state.compatMode
            ? `${status === 'green' ? 'Ready for DeadMoon_Download_BotV3' : status === 'yellow' ? 'Partial capture' : 'Waiting for capture'} · ${done.complete}/${done.total} platforms ready`
            : `Standalone Token/Cookie Extractor Mode · ${done.complete}/${done.total} platforms captured`;

        const modePill = panel.querySelector('[data-action="toggle-compat"]');
        modePill.textContent = state.compatMode ? '🌙 DeadMoon_Downloader: ON' : '⚡ Standalone Extractor: ON';
        modePill.classList.toggle('compat-on', state.compatMode);

        shadow.getElementById('toggle').textContent = state.collapsed ? '▴' : '▾';
        body.classList.toggle('hidden', state.collapsed);
        if (state.collapsed) return;

        const tabsNav = shadow.getElementById('tabs');
        if (state.compatMode) {
            tabsNav.innerHTML = `
                <button data-tab="site" class="${state.tab === 'site' ? 'active' : ''}">🎧 Current Platform</button>
                <button data-tab="master" class="${state.tab === 'master' ? 'active' : ''}">🌙 Master token.env (68 Keys)</button>`;
        } else {
            if (state.tab === 'master') state.tab = 'vault';
            tabsNav.innerHTML = `
                <button data-tab="site" class="${state.tab === 'site' ? 'active' : ''}">🎧 Current Platform</button>
                <button data-tab="vault" class="${state.tab === 'vault' ? 'active' : ''}">✨ Universal Token Vault (JSON)</button>`;
        }

        panel.querySelector('main').innerHTML =
            state.tab === 'master' && state.compatMode
                ? masterHtml()
                : state.tab === 'vault' && !state.compatMode
                    ? standaloneVaultHtml()
                    : siteHtml();

        const footer = shadow.getElementById('footer-actions');
        if (state.compatMode) {
            footer.innerHTML = `
                <button class="primary" data-action="copy-env">🌙 Copy V3 token.env</button>
                <button data-action="download-env">📦 Download token.env</button>
                <button class="purple" data-action="download-all">📦 Export local_resources/*</button>
                <button class="danger" data-action="clear">🌑 Clear</button>`;
        } else {
            footer.innerHTML = `
                <button class="primary" data-action="copy-vault-json">✨ Copy All Tokens (JSON)</button>
                <button data-action="download-vault-json">📦 Download deadmoon-tokens.json</button>
                <button data-action="download-raw-cookies">🍪 Export Site cookies.txt</button>
                <button class="danger" data-action="clear">🌑 Clear</button>`;
        }
    }

    function scheduleRefresh() {
        clearTimeout(state.refreshTimer);
        state.refreshTimer = setTimeout(() => {
            if (document.activeElement && shadow && shadow.activeElement && /INPUT|TEXTAREA|SELECT/.test(shadow.activeElement.tagName)) return;
            render();
        }, 120);
    }

    function keyRows() {
        const keys = siteKeys();
        if (!keys.length) return `<p class="muted">No environment keys required for this site — export cookies.txt below.</p>`;
        return keys.map(key => `<div class="row"><span class="key" title="${key}">${key}</span><span class="masked">${escapeHtml(mask(value(key)))}</span><button class="small" data-action="copy-key" data-key="${key}" ${value(key) ? '' : 'disabled'}>Copy</button></div>`).join('');
    }

    function editableInput(key, label, type = 'text', placeholder = '') {
        return `<label for="edit-${key}">${label}</label><input id="edit-${key}" data-setting="${key}" type="${type}" value="${escapeHtml(value(key))}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" spellcheck="false">`;
    }

    function siteHtml() {
        const modeTitle = state.compatMode ? '🌙 DeadMoon_Download_BotV3 Captures' : '⚡ Standalone Token & Session Captures';
        let html = `<section class="card"><h3>${modeTitle}</h3>${keyRows()}</section>`;
        if (PLATFORM === 'tidal') html += tidalHtml();
        if (PLATFORM === 'deezer') html += deezerHtml();
        if (PLATFORM === 'qobuz') html += qobuzHtml();
        if (PLATFORM === 'spotify') html += spotifyHtml();
        if (PLATFORM === 'apple') html += appleHtml();
        if (PLATFORM === 'amazon') html += amazonHtml();
        if (PLATFORM === 'telegram') html += `<section class="card"><h3>🌙 Telegram Bot & Admin Identity</h3>${editableInput('TELEGRAM_TOKEN', 'Bot token from @BotFather', 'password')}${editableInput('ADMIN_ID', 'Your numeric Telegram ADMIN_ID')}</section>`;
        if (PLATFORM === 'youtube' || PLATFORM === 'soundcloud') html += socialHtml();
        return html;
    }

    function deezerHtml() {
        const hasArl = isPlatformReady('deezer');
        const gmCookieOk = typeof GM_cookie !== 'undefined' && GM_cookie && typeof GM_cookie.list === 'function';
        return `<section class="card">
            <h3>🎧 Deezer ARL Harvester</h3>
            <p class="${hasArl ? 'ok' : 'notice'}">
                ${hasArl
                    ? '🌕 192-char Deezer ARL captured and ready!'
                    : gmCookieOk
                        ? '🌒 Click "Fetch ARL Now" or paste any F12 Network Cookie header / cURL command into the box below to auto-extract the 192-char ARL.'
                        : '⚠️ GM_cookie is disabled in Tampermonkey. Enable Settings → Config Mode: Advanced → Experimental Cookie API, OR paste any F12 Network Cookie header / cURL command below!'}
            </p>
            <div class="row">
                <button class="primary" data-action="deezer-arl" ${state.deezerBusy ? 'disabled' : ''}>${state.deezerBusy ? '🌓 Scanning ARL…' : '🌕 Fetch ARL Now'}</button>
                <button data-action="deezer-paste-clipboard">📋 Extract ARL from Clipboard (cURL / Header)</button>
                <button data-action="copy-key" data-key="DEEZER_TOKEN" ${hasArl ? '' : 'disabled'}>Copy Raw ARL</button>
                ${state.compatMode ? `<button class="purple" data-action="copy-auth-cmd" ${hasArl ? '' : 'disabled'}>💬 Copy /authenticatedeezer</button>` : ''}
            </div>
            ${editableInput('DEEZER_TOKEN', 'Deezer ARL Cookie (192 chars — or paste raw F12 Cookie header / "Copy as cURL" here to auto-extract)', 'text', 'Paste 192-char hex ARL, Cookie: arl=..., or F12 Copy as cURL')}
            ${editableInput('DEEZER_USERNAME', 'Email (optional)')}
            ${editableInput('DEEZER_PASSWORD', 'Password (optional)', 'password')}
        </section>`;
    }

    function tidalHtml() {
        const hasRefresh = Boolean(value('TIDAL_REFRESH_TOKEN'));
        const pending = getPendingTidal();
        const cid = state.metadata.tidalClientId || jwtClientId(value('TIDAL_ACCESS_TOKEN'));
        const isWebToken = cid === '3235' || cid === '8049';
        return `<section class="card">
            <h3>🎧 Tidal 24-Bit / 192 kHz Hi-Res Provisioning</h3>
            <p class="${hasRefresh && !isWebToken ? 'ok' : 'notice'}">
                ${hasRefresh && !isWebToken
                    ? '🌕 Full 24-Bit Hi-Res TV Device OAuth + Refresh Token captured (cid=' + escapeHtml(cid || 'TV') + ')!'
                    : isWebToken
                        ? `⚠️ Captured token is a Web Player token (cid=${escapeHtml(cid)}), which Tidal blocks on direct manifest downloads. Run "1. Start 24-Bit Hi-Res Device Login" below!`
                        : '🌒 Step 1: Click "1. Start 24-Bit Hi-Res Device Login". Step 2: Approve in the opened link.tidal.com tab.'}
            </p>
            <div class="row">
                <button class="primary" data-action="tidal-device" ${state.tidalBusy ? 'disabled' : ''}>
                    ${state.tidalBusy ? '🌓 Polling link.tidal.com…' : '1. Start 24-Bit Hi-Res Device Login'}
                </button>
                <button data-action="tidal-exchange-now" ${pending ? '' : 'disabled'}>
                    2. Complete Linked Exchange
                </button>
            </div>
            ${state.compatMode ? `
            <div class="row">
                <button class="purple" data-action="site-file" ${isPlatformReady('tidal') ? '' : 'disabled'}>📦 Download tidal_config.toml</button>
                <button data-action="copy-auth-cmd" ${isPlatformReady('tidal') ? '' : 'disabled'}>💬 Copy /authenticatetidal Command</button>
            </div>
            <p class="muted">Target V3 resource: <code>/usr/src/app/local_resources/tidal_config.toml</code> (JWT <code>uid</code>, <code>exp</code> & <code>cc</code> auto-synced).</p>` : `
            <div class="row">
                <button class="purple" data-action="copy-key" data-key="TIDAL_ACCESS_TOKEN" ${value('TIDAL_ACCESS_TOKEN') ? '' : 'disabled'}>Copy Bearer Access Token</button>
                <button data-action="copy-key" data-key="TIDAL_REFRESH_TOKEN" ${value('TIDAL_REFRESH_TOKEN') ? '' : 'disabled'}>Copy Refresh Token</button>
                <button data-action="copy-key" data-key="TIDAL_OAUTH_TOKEN" ${value('TIDAL_OAUTH_TOKEN') ? '' : 'disabled'}>Copy OAuth JSON</button>
            </div>`}
            ${pending ? `<p class="ok">🌔 Pending code <code>${escapeHtml(pending.userCode)}</code> — <a href="${escapeHtml(pending.verificationUrl)}" target="_blank" style="color:var(--accent)">${escapeHtml(pending.verificationUrl)}</a></p>` : ''}
            ${editableInput('TIDAL_USER_ID', 'TIDAL_USER_ID (auto-filled from JWT uid)')}
            ${editableInput('TIDAL_ACCESS_TOKEN', 'TIDAL_ACCESS_TOKEN (Bearer JWT)')}
            ${editableInput('TIDAL_REFRESH_TOKEN', 'TIDAL_REFRESH_TOKEN')}
            ${editableInput('TIDAL_TOKEN_EXPIRY', 'TIDAL_TOKEN_EXPIRY (auto-filled from JWT exp)')}
            ${editableInput('TIDAL_COUNTRY_CODE', 'TIDAL_COUNTRY_CODE (auto-filled from JWT cc)')}
        </section>`;
    }

    function qobuzHtml() {
        const ready = isPlatformReady('qobuz');
        return `<section class="card">
            <h3>🎧 Qobuz Credentials & Bundle Secret Extractor</h3>
            <div class="row">
                <button class="primary" data-action="qobuz-bundle" ${state.qobuzBusy ? 'disabled' : ''}>${state.qobuzBusy ? '🌓 Inspecting bundle.js…' : '🌕 Extract app_id & secrets from bundle.js'}</button>
                ${state.compatMode ? `
                <button class="purple" data-action="site-file" ${ready ? '' : 'disabled'}>📦 Download qobuz_config.toml</button>
                <button data-action="copy-auth-cmd" ${ready ? '' : 'disabled'}>💬 Copy /authenticateqobuz</button>` : `
                <button class="purple" data-action="copy-key" data-key="QOBUZ_USER_AUTH_TOKEN" ${value('QOBUZ_USER_AUTH_TOKEN') ? '' : 'disabled'}>Copy Auth Token</button>`}
            </div>
            ${state.compatMode ? `<p class="muted">Target V3 resource: <code>/usr/src/app/local_resources/qobuz_config.toml</code></p>` : ''}
            ${editableInput('QOBUZ_USER_ID', 'QOBUZ_USER_ID')}
            ${editableInput('QOBUZ_USER_AUTH_TOKEN', 'QOBUZ_USER_AUTH_TOKEN', 'password')}
            ${editableInput('QOBUZ_APP_ID', 'QOBUZ_APP_ID')}
            ${editableInput('QOBUZ_SECRETS', 'QOBUZ_SECRETS (comma-separated)')}
            ${editableInput('QOBUZ_EMAIL', 'QOBUZ_EMAIL (optional login fallback)')}
            ${editableInput('QOBUZ_PASSWORD', 'QOBUZ_PASSWORD (auto-MD5 hashed in TOML)', 'password')}
        </section>`;
    }

    function spotifyHtml() {
        const spDc = getSpotifySpDc();
        return `<section class="card">
            <h3>🎧 Spotify Web Session + Widevine L3</h3>
            <p class="${spDc ? 'ok' : 'notice'}">
                ${spDc
                    ? '🌕 .spotify.com sp_dc cookie captured (' + spDc.length + ' chars).'
                    : '🌒 sp_dc cookie not detected yet. Sign in or paste sp_dc below if HttpOnly is blocked.'}
            </p>
            <label for="spotify-spdc-input">.spotify.com sp_dc cookie value</label>
            <input id="spotify-spdc-input" data-meta="sp_dc" value="${escapeHtml(spDc)}" autocomplete="off" spellcheck="false" placeholder="Paste sp_dc value here if not auto-captured">
            <div class="row">
                <button class="primary" data-action="site-file" ${spDc ? '' : 'disabled'}>📦 Download spotify_cookies.txt</button>
                <button data-action="download-spotify-json" ${spDc ? '' : 'disabled'}>📦 Download spotify_credentials.json</button>
                <button class="purple" data-action="copy-spdc" ${spDc ? '' : 'disabled'}>Copy Raw sp_dc</button>
            </div>
            ${state.compatMode ? `<p class="muted">Target V3 resource: <code>/usr/src/app/local_resources/spotify_cookies.txt</code></p>` : ''}
        </section>` + wvdCardHtml();
    }

    function appleHtml() {
        const hasMut = Boolean(value('APPLE_MEDIA_USER_TOKEN'));
        return `<section class="card">
            <h3>🎧 Apple Music (media-user-token & Netscape Cookies)</h3>
            <p class="${hasMut ? 'ok' : 'notice'}">${hasMut ? '🌕 media-user-token captured.' : '🌒 Sign in to music.apple.com or paste media-user-token below.'}</p>
            ${editableInput('APPLE_MEDIA_USER_TOKEN', 'APPLE_MEDIA_USER_TOKEN')}
            <div class="row">
                <button class="primary" data-action="site-file" ${hasMut ? '' : 'disabled'}>📦 Download apple_cookies.txt</button>
                <button data-action="copy-key" data-key="APPLE_MEDIA_USER_TOKEN" ${hasMut ? '' : 'disabled'}>Copy Raw Token</button>
                ${state.compatMode ? `<button class="purple" data-action="copy-auth-cmd" ${hasMut ? '' : 'disabled'}>💬 Copy /authenticateapple</button>` : ''}
            </div>
            ${state.compatMode ? `<p class="muted">Target V3 resource: <code>/usr/src/app/local_resources/apple_cookies.txt</code> (includes .apple.com, music.apple.com, and .music.apple.com rows).</p>` : ''}
        </section>`;
    }

    function socialHtml() {
        const hasSc = Boolean(value('SOUNDCLOUD_OAUTH_TOKEN'));
        return `<section class="card">
            <h3>🎧 ${PLATFORM === 'soundcloud' ? 'SoundCloud OAuth & Cookies' : 'YouTube Cookies'}</h3>
            ${PLATFORM === 'soundcloud' ? editableInput('SOUNDCLOUD_OAUTH_TOKEN', 'SOUNDCLOUD_OAUTH_TOKEN') : ''}
            <div class="row">
                <button class="primary" data-action="site-file">📦 Download cookies.txt</button>
                ${PLATFORM === 'soundcloud' && state.compatMode ? `<button class="purple" data-action="copy-auth-cmd" ${hasSc ? '' : 'disabled'}>💬 Copy /authenticatesoundcloud</button>` : ''}
            </div>
        </section>`;
    }

    function wvdCardHtml() {
        return `<section class="card">
            <h3>📦 Widevine L3 Device Provisioning (device.wvd)</h3>
            <div class="drop" data-action="choose-wvd">
                Drop <code>device.wvd</code>, or <code>client_id.bin</code> + <code>private_key.pem</code> here<br>
                <span class="muted">or click to select files to validate/pack into pywidevine v2 .wvd</span>
            </div>
            <input class="hidden" id="wvd-files" type="file" multiple accept=".wvd,.bin,.pem">
            <p class="muted">${wvdBytes() ? '🌕 Validated device.wvd stored: ' + wvdBytes().length + ' bytes' : '🌑 No device.wvd imported in browser storage.'}</p>
            <div class="row">
                <button data-action="download-wvd" ${wvdBytes() ? '' : 'disabled'}>📦 Download device.wvd</button>
            </div>
        </section>`;
    }

    function amazonHtml() {
        return `<section class="card">
            <h3>🎧 Amazon Music Device Token</h3>
            ${editableInput('AMAZON_DEVICE_TOKEN', 'AMAZON_DEVICE_TOKEN (JSON)')}
            <div class="row">
                <button class="primary" data-action="copy-key" data-key="AMAZON_DEVICE_TOKEN" ${value('AMAZON_DEVICE_TOKEN') ? '' : 'disabled'}>Copy Device Token JSON</button>
            </div>
        </section>` + wvdCardHtml();
    }

    function masterHtml() {
        const copyPathSet = Boolean(value('COPY_FILES_PATH').trim());
        const isAudioMode = value('FORMAT').toLowerCase() !== 'zip' && !copyPathSet;
        return `<section class="card">
            <h3>🌙 DeadMoon_Download_BotV3 Master token.env (68 Keys)</h3>
            <p class="${isAudioMode ? 'ok' : 'notice'}">
                ${isAudioMode
                    ? '🌕 Delivery Mode: Direct Telegram Native Audio (FORMAT=audio, COPY_FILES_PATH blank).'
                    : '📦 Delivery Mode: ZIP Archive / Hosted Link (FORMAT=zip or COPY_FILES_PATH is set). Note: in V3, setting COPY_FILES_PATH forces hosted .zip mode!'}
            </p>
            <div class="row">
                <button class="small" data-action="preset-audio">🎧 Preset: Telegram Native Audio</button>
                <button class="small" data-action="preset-hosted-zip">📦 Preset: Hosted Server .zip (/files)</button>
            </div>
            <div class="row">
                <label style="display:flex;align-items:center;gap:6px;margin:0;cursor:pointer;color:var(--text)">
                    <input type="checkbox" id="toggle-inline-secrets" ${state.inlineOffloadedSecrets ? 'checked' : ''}>
                    Include inline Tidal/Qobuz/Apple secrets in token.env (leave unchecked when using local_resources/*.toml)
                </label>
            </div>
            <textarea class="env" id="env-preview" readonly>${escapeHtml(buildEnv())}</textarea>
            <div class="row">
                <button class="primary" data-action="copy-env">🌙 Copy full token.env</button>
                <button data-action="download-env">📦 Download token.env</button>
                <button class="purple" data-action="download-all">📦 Download All local_resources/* Files</button>
                <button data-action="refresh">🔄 Refresh</button>
            </div>
        </section>
        <section class="card">
            <h3>⚙️ DeadMoon_Download_BotV3 Settings</h3>
            <div class="grid">
                ${Array.from(SETTINGS_KEYS).map(key => `<div><label for="setting-${key}">${key}</label><input id="setting-${key}" data-setting="${key}" value="${escapeHtml(value(key))}" autocomplete="off"></div>`).join('')}
            </div>
        </section>`;
    }

    function standaloneVaultHtml() {
        return `<section class="card">
            <h3>✨ Standalone Universal Credential Vault (JSON)</h3>
            <p class="muted">DeadMoon_Downloader compatibility mode is OFF. Raw ARLs, OAuth tokens, cookies, and API secrets are exported directly without Bot V3 container paths or token.env scaffolding.</p>
            <textarea class="env" id="vault-preview" readonly>${escapeHtml(exportStandaloneJson())}</textarea>
            <div class="row">
                <button class="primary" data-action="copy-vault-json">✨ Copy All Tokens (JSON)</button>
                <button data-action="download-vault-json">📦 Download deadmoon-tokens.json</button>
                <button data-action="download-raw-cookies">🍪 Export Current Site cookies.txt</button>
            </div>
        </section>`;
    }

    function setManualValue(key, raw) {
        if (!Object.prototype.hasOwnProperty.call(ENV_DEFAULTS, key)) return;
        let next = String(raw === undefined || raw === null ? '' : raw).replace(/[\r\n\0]/g, '').trim();
        if (key === 'DEEZER_TOKEN' && next) {
            const extracted = extractDeezerArlFromText(next);
            if (isValidDeezerArl(extracted)) next = extracted;
        }
        state.values[key] = next;
        if (key === 'TIDAL_ACCESS_TOKEN') decodeTidalJwt(next);
        if (/^TIDAL_(ACCESS_TOKEN|REFRESH_TOKEN|USER_ID|TOKEN_EXPIRY|COUNTRY_CODE)$/.test(key)) {
            updateTidalBlob();
        }
        persist('values');
    }

    function handleLiveInput(event) {
        const target = event.target;
        if (!target || target.dataset.setting !== 'DEEZER_TOKEN') return;
        const extracted = extractDeezerArlFromText(target.value || '');
        if (isValidDeezerArl(extracted) && target.value.trim() !== extracted) {
            target.value = extracted;
            setManualValue('DEEZER_TOKEN', extracted);
            render();
            toast('🌕 Extracted 192-char Deezer ARL from pasted Network header/cURL!');
        }
    }

    async function handleAction(event) {
        const element = event.target.closest('[data-action]');
        if (!element) return;
        const action = element.dataset.action;
        try {
            if (action === 'toggle-compat') {
                event.stopPropagation();
                state.compatMode = !state.compatMode;
                gmSet('compatMode', state.compatMode);
                state.tab = 'site';
                render();
                toast(state.compatMode
                    ? '🌙 DeadMoon_Downloader V3 Compatibility Mode ENABLED.'
                    : '⚡ Standalone Universal Extractor Mode ENABLED.');
            }
            else if (action === 'preset-audio') {
                state.values.FORMAT = 'audio';
                state.values.COPY_FILES_PATH = '';
                persist('values');
                render();
                toast('🎧 Set FORMAT=audio and cleared COPY_FILES_PATH for direct Telegram audio.');
            }
            else if (action === 'preset-hosted-zip') {
                state.values.FORMAT = 'zip';
                state.values.COPY_FILES_PATH = '/files';
                persist('values');
                render();
                toast('📦 Set FORMAT=zip and COPY_FILES_PATH=/files for hosted archive links.');
            }
            else if (action === 'copy-key') copyText(value(element.dataset.key), '🌕 ' + element.dataset.key + ' copied.');
            else if (action === 'copy-spdc') copyText(getSpotifySpDc(), '🌕 Spotify sp_dc copied.');
            else if (action === 'copy-auth-cmd') {
                const cmd = buildAuthenticateCommand(PLATFORM);
                copyText(cmd, '💬 Copied Telegram command: ' + cmd.split(' ')[0]);
            }
            else if (action === 'copy-env') copyText(buildEnv(), '🌕 Full 68-key V3 token.env copied to clipboard.');
            else if (action === 'download-env') downloadText(buildEnv(), 'token.env');
            else if (action === 'download-all') await exportAllFiles();
            else if (action === 'copy-vault-json') copyText(exportStandaloneJson(), '✨ Standalone Token Vault JSON copied.');
            else if (action === 'download-vault-json') downloadText(exportStandaloneJson(), 'deadmoon-tokens.json', 'application/json');
            else if (action === 'download-raw-cookies') {
                await scanCookies();
                const list = state.cookies[PLATFORM] || [];
                if (!list.length) throw new Error('No cookies captured on this site yet.');
                downloadText(netscapeFile(list, `Exported ${PLATFORM} cookies`), `${PLATFORM}_cookies.txt`);
            }
            else if (action === 'clear') clearStoredCredentials();
            else if (action === 'site-file') { await scanCookies(); exportSiteFile(); }
            else if (action === 'download-spotify-json') {
                await scanCookies();
                downloadText(exportSpotifyCredentialsJson(), 'spotify_credentials.json', 'application/json');
            }
            else if (action === 'deezer-arl') await harvestDeezerArl(false);
            else if (action === 'deezer-paste-clipboard') {
                if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
                    throw new Error('Clipboard read blocked by browser — paste directly into the Deezer ARL input box below.');
                }
                const clip = await navigator.clipboard.readText();
                const extracted = extractDeezerArlFromText(clip || '');
                if (!isValidDeezerArl(extracted)) {
                    throw new Error('No 192-char hex ARL found in clipboard. In F12 Network tab, right-click any Deezer request → Copy as cURL, then click this button.');
                }
                put('DEEZER_TOKEN', extracted, true);
                render();
                toast('🌕 Extracted 192-char Deezer ARL from clipboard!');
            }
            else if (action === 'qobuz-bundle') await harvestQobuzBundle();
            else if (action === 'tidal-device') await startTidalDeviceFlow();
            else if (action === 'tidal-exchange-now') await tryExchangePendingTidal(false);
            else if (action === 'choose-wvd') shadow.getElementById('wvd-files').click();
            else if (action === 'download-wvd') downloadWvd();
            else if (action === 'refresh') { loadState(); updateTidalBlob(); render(); toast('🌕 Preview refreshed.'); }
        } catch (error) {
            toast('🌑 ' + (error.message || String(error)));
        }
    }

    function handleChange(event) {
        const target = event.target;
        if (target.id === 'wvd-files') {
            importWvdFiles(target.files).finally(() => { target.value = ''; });
            return;
        }
        if (target.id === 'toggle-inline-secrets') {
            state.inlineOffloadedSecrets = Boolean(target.checked);
            gmSet('inlineOffloadedSecrets', state.inlineOffloadedSecrets);
            render();
            return;
        }
        if (target.dataset.setting) setManualValue(target.dataset.setting, target.value);
        if (target.dataset.meta) remember(target.dataset.meta, target.value.trim());
        render();
    }

    function toast(message) {
        if (!shadow) return;
        const element = shadow.getElementById('toast');
        if (!element) return;
        element.textContent = String(message || '').replace(/[\r\n]/g, ' ').slice(0, 500);
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 6500);
    }

    function periodicScan() {
        loadState();
        scanStorage(PAGE.localStorage);
        scanStorage(PAGE.sessionStorage);
        scanPageConfig();
        scanTelegramDom();
        scanCookies().catch(() => {});
        if (PLATFORM === 'tidal' && getPendingTidal() && !value('TIDAL_REFRESH_TOKEN')) {
            tryExchangePendingTidal(true);
        }
    }

    function afterDomReady() {
        initHud();
        periodicScan();
        scanIndexedDb();
        if (PLATFORM === 'tidal' && getPendingTidal()) {
            setTimeout(() => tryExchangePendingTidal(false), 600);
            setTimeout(() => tryExchangePendingTidal(true), 2500);
        }
        if (PLATFORM === 'qobuz') setTimeout(() => harvestQobuzBundle(), 4000);
        if (PLATFORM === 'deezer') harvestDeezerArl(true);
        if (PLATFORM === 'telegram' && typeof MutationObserver === 'function') {
            let timer;
            const observer = new MutationObserver(() => {
                clearTimeout(timer);
                timer = setTimeout(() => { scanTelegramDom(); }, 500);
            });
            if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        }
    }

    if (PLATFORM) {
        state.widevine = gmGet('widevine', []) || [];
        installNetworkHooks();
        try {
            PAGE.addEventListener('storage', event => {
                if (event.key && event.newValue) scanStorageEntry(event.key, event.newValue);
            });
        } catch (_) {}
        initHud();
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afterDomReady, { once: true });
        else afterDomReady();
        setInterval(periodicScan, 15000);
    }
})();
