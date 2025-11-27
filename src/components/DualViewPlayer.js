"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DualViewPlayer_v4_0;
var React = __importStar(require("react"));
var framer_1 = require("framer");
/* ===== Helpers ===== */
var SPEEDS = [0.5, 1, 1.25, 1.5, 1.75, 2];
var isHls = function (u) { return /\.m3u8($|\?)/i.test(u); };
var nativeHls = function (video) {
    return video.canPlayType("application/vnd.apple.mpegurl") !== "";
};
var clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
};
function extractSrc(html) {
    if (!html)
        return "";
    var t = html.trim();
    if (/^https?:\/\//i.test(t))
        return t;
    try {
        var doc = new DOMParser().parseFromString(t, "text/html");
        var s = doc.querySelector("source[src]");
        if (s === null || s === void 0 ? void 0 : s.src)
            return s.src;
        var v = doc.querySelector("video[src]");
        if (v === null || v === void 0 ? void 0 : v.src)
            return v.src;
    }
    catch (_a) { }
    return "";
}
function parseTime(text) {
    var s = (text || "").trim();
    if (!s)
        return null;
    if (/^\d+$/.test(s))
        return parseInt(s, 10);
    var clock = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if (clock) {
        var h = clock[3] ? parseInt(clock[1], 10) : 0;
        var m = clock[3] ? parseInt(clock[2], 10) : parseInt(clock[1], 10);
        var sec = parseInt(clock[3] || clock[2], 10);
        return h * 3600 + m * 60 + sec;
    }
    var words = s.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
    if (words && (words[1] || words[2] || words[3])) {
        var h = parseInt(words[1] || "0", 10);
        var m = parseInt(words[2] || "0", 10);
        var sec = parseInt(words[3] || "0", 10);
        return h * 3600 + m * 60 + sec;
    }
    return null;
}
function chaptersFromArray(items) {
    if (!items)
        return [];
    return items
        .map(function (it) {
        var t = parseTime(it.time);
        if (t === null)
            return null;
        return { label: (it.label || "").trim() || "".concat(t, "s"), t: t };
    })
        .filter(function (x) { return !!x; })
        .sort(function (a, b) { return a.t - b.t; });
}
var hlsLoading = null;
function loadHls() {
    if (window.Hls)
        return Promise.resolve(window.Hls);
    if (hlsLoading)
        return hlsLoading;
    hlsLoading = new Promise(function (resolve) {
        var s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
        s.async = true;
        s.onload = function () { return resolve(window.Hls || null); };
        s.onerror = function () { return resolve(null); };
        document.head.appendChild(s);
    });
    return hlsLoading;
}
/* ===== Icons (compact) ===== */
var Icon = {
    Play: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M8 5v14l11-7z" }))); },
    Pause: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M6 5h4v14H6zM14 5h4v14h-4z" }))); },
    Volume: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M5 10v4h4l5 4V6l-5 4H5z" }))); },
    Mute: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M3 9v6h4l5 4V5L7 9H3zM19 7l-1.4-1.4-3.6 3.6-3.6-3.6L9 7l3.6 3.6L9 14.2 10.4 15.6 14 12l3.6 3.6 1.4-1.4L15.4 10.6 19 7z" }))); },
    Speed: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm1 1v7l5 3 .9-1.8-4.4-2.6V5z" }))); },
    Swap: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M7 7h11v2H7l3 3-1.4 1.4L3.2 8l5.4-5.4L10 4 7 7zm10 10H6v-2h11l-3-3 1.4-1.4 5.4 5.4-5.4 5.4L14 20l3-3z" }))); },
    FS: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", stroke: "currentColor", fill: "none", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M4 10V5a1 1 0 0 1 1-1h5" }),
        React.createElement("path", { d: "M20 10V5a1 1 0 0 0-1-1h-5" }),
        React.createElement("path", { d: "M4 14v5a1 1 0 0 0 1 1h5" }),
        React.createElement("path", { d: "M20 14v5a1 1 0 0 1-1 1h-5" }))); },
    FSExit: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", stroke: "currentColor", fill: "none", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M9 4H5a1 1 0 0 0-1 1v4" }),
        React.createElement("path", { d: "M15 4h4a1 1 0 0 1 1 1v4" }),
        React.createElement("path", { d: "M9 20H5a1 1 0 0 1-1-1v-4" }),
        React.createElement("path", { d: "M15 20h4a1 1 0 0 0 1-1v-4" }))); },
    Chapter: function () { return (React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M5 4h14v2H5zm0 6h14v2H5zm0 6h10v2H5z" }))); },
    Quality: function () { return (React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" }))); },
    Prev: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M6 12l8-8v6h4v4h-4v6z" }))); },
    Next: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { transform: "scaleX(-1)" } },
        React.createElement("path", { fill: "currentColor", d: "M6 12l8-8v6h4v4h-4v6z" }))); },
    Back10: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M11 5V2L6 7l5 5V9c2.76 0 5 2.24 5 5a5 5 0 1 1-5-5z" }))); },
    Fwd10: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { transform: "scaleX(-1)" } },
        React.createElement("path", { fill: "currentColor", d: "M11 5V2L6 7l5 5V9c2.76 0 5 2.24 5 5a5 5 0 1 1-5-5z" }))); },
    PopOut: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V3zM5 5h7v2H7v10h10v-5h2v7H5V5z" }))); },
    Link: function () { return (React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5zm7.1 1h2v-2h-2v2zm4-6h3a5 5 0 0 1 0 10h-3v-2h3a3 3 0 1 0 0-6h-3V7z" }))); },
};
/* ===== Component ===== */
function DualViewPlayer_v4_0(_a) {
    var _this = this;
    var _b, _c;
    var mentorHtml = _a.mentorHtml, displayHtml = _a.displayHtml, _d = _a.instanceId, instanceId = _d === void 0 ? "dualview" : _d, _f = _a.startView, startView = _f === void 0 ? "mentor" : _f, _g = _a.autoplay, autoplay = _g === void 0 ? true : _g, _h = _a.muted, muted = _h === void 0 ? true : _h, _j = _a.loop, loop = _j === void 0 ? false : _j, _k = _a.objectFit, objectFit = _k === void 0 ? "cover" : _k, _l = _a.aspect, aspect = _l === void 0 ? "16:9" : _l, _m = _a.accent, accent = _m === void 0 ? "#7C3AED" : _m, _o = _a.compactUI, compactUI = _o === void 0 ? true : _o, _p = _a.autoHideMs, autoHideMs = _p === void 0 ? 3200 : _p, _q = _a.alwaysShowControls, alwaysShowControls = _q === void 0 ? false : _q, _r = _a.pip, pip = _r === void 0 ? true : _r, _s = _a.pipSizePct, pipSizePct = _s === void 0 ? 24 : _s, _u = _a.pipStartCorner, pipStartCorner = _u === void 0 ? "br" : _u, _v = _a.pipRememberPosition, pipRememberPosition = _v === void 0 ? true : _v, _w = _a.pipSnap, pipSnap = _w === void 0 ? true : _w, _x = _a.pipWheelResize, pipWheelResize = _x === void 0 ? true : _x, _y = _a.pipMinPct, pipMinPct = _y === void 0 ? 12 : _y, _z = _a.pipMaxPct, pipMaxPct = _z === void 0 ? 44 : _z, _0 = _a.timestamps, timestamps = _0 === void 0 ? [] : _0, _1 = _a.enableDeepLinks, enableDeepLinks = _1 === void 0 ? true : _1, _2 = _a.updateUrlOnSeek, updateUrlOnSeek = _2 === void 0 ? true : _2, _3 = _a.skipSmall, skipSmall = _3 === void 0 ? 0.25 : _3, _4 = _a.skipBig, skipBig = _4 === void 0 ? 5 : _4, _5 = _a.showBuffered, showBuffered = _5 === void 0 ? true : _5, _6 = _a.showVolumeSlider, showVolumeSlider = _6 === void 0 ? true : _6, _7 = _a.keyboardHelpOverlay, keyboardHelpOverlay = _7 === void 0 ? true : _7, _8 = _a.autoPauseOffscreen, autoPauseOffscreen = _8 === void 0 ? true : _8, _9 = _a.hlsLowLatency, hlsLowLatency = _9 === void 0 ? true : _9, _10 = _a.hlsPreferLowStart, hlsPreferLowStart = _10 === void 0 ? true : _10, _11 = _a.hlsCapToSize, hlsCapToSize = _11 === void 0 ? true : _11, _12 = _a.enableNativePiP, enableNativePiP = _12 === void 0 ? true : _12, _13 = _a.debug, debug = _13 === void 0 ? false : _13;
    var containerRef = React.useRef(null);
    var mentorRef = React.useRef(null);
    var displayRef = React.useRef(null);
    var pipCanvasRef = React.useRef(null);
    var mentorHlsRef = React.useRef(null);
    var displayHlsRef = React.useRef(null);
    var nativePipTargetRef = React.useRef(null);
    var _14 = React.useState(startView), view = _14[0], setView = _14[1];
    var _15 = React.useState(1), rateIndex = _15[0], setRateIndex = _15[1];
    var _16 = React.useState(!!muted), mentorMuted = _16[0], setMentorMuted = _16[1];
    var _17 = React.useState(1), mentorVolume = _17[0], setMentorVolume = _17[1];
    var _18 = React.useState(0), duration = _18[0], setDuration = _18[1];
    var _19 = React.useState(0), current = _19[0], setCurrent = _19[1];
    var _20 = React.useState(true), showUI = _20[0], setShowUI = _20[1];
    var _21 = React.useState(false), holdUI = _21[0], setHoldUI = _21[1];
    var _22 = React.useState(false), isFS = _22[0], setIsFS = _22[1];
    var _23 = React.useState(false), isBuffering = _23[0], setIsBuffering = _23[1];
    var _24 = React.useState(null), errorText = _24[0], setErrorText = _24[1];
    var _25 = React.useState(0), bufferedPct = _25[0], setBufferedPct = _25[1];
    var _26 = React.useState(false), showHelp = _26[0], setShowHelp = _26[1];
    // Chapters
    var chapters = React.useMemo(function () { return chaptersFromArray(timestamps); }, [timestamps]);
    var _27 = React.useState(null), tooltip = _27[0], setTooltip = _27[1];
    // Quality state
    var _28 = React.useState([]), mentorLevels = _28[0], setMentorLevels = _28[1];
    var _29 = React.useState([]), displayLevels = _29[0], setDisplayLevels = _29[1];
    var qualities = React.useMemo(function () {
        return Array.from(new Set(__spreadArray(__spreadArray([], mentorLevels, true), displayLevels, true))).sort(function (a, b) { return b - a; });
    }, [mentorLevels, displayLevels]);
    var _30 = React.useState(-1), quality = _30[0], setQuality = _30[1];
    var _31 = React.useState(false), qOpen = _31[0], setQOpen = _31[1];
    var anyHls = isHls(extractSrc(mentorHtml)) || isHls(extractSrc(displayHtml));
    // Chapters popover
    var _32 = React.useState(false), chaptersOpen = _32[0], setChaptersOpen = _32[1];
    // PiP placement
    var storedKey = "dvp.".concat(instanceId, ".pip");
    var storedSizeKey = "dvp.".concat(instanceId, ".pip.size");
    var defaultPos = React.useMemo(function () {
        switch (pipStartCorner) {
            case "bl":
                return { x: 6, y: 88 };
            case "tr":
                return { x: 88, y: 6 };
            case "tl":
                return { x: 6, y: 6 };
            default:
                return { x: 88, y: 88 };
        }
    }, [pipStartCorner]);
    var _33 = React.useState(function () {
        if (pipRememberPosition) {
            try {
                var s = localStorage.getItem(storedKey);
                if (s)
                    return JSON.parse(s);
            }
            catch (_a) { }
        }
        return defaultPos;
    }), pipPos = _33[0], setPipPos = _33[1];
    var _34 = React.useState(function () {
        if (pipRememberPosition) {
            try {
                var s = localStorage.getItem(storedSizeKey);
                if (s)
                    return JSON.parse(s);
            }
            catch (_a) { }
        }
        return pipSizePct;
    }), pipSize = _34[0], setPipSize = _34[1];
    var _35 = React.useState(false), pipCollapsed = _35[0], setPipCollapsed = _35[1];
    var srcMentor = extractSrc(mentorHtml);
    var srcDisplay = extractSrc(displayHtml);
    var isMentorMain = view === "mentor";
    var FONT = compactUI ? 12 : 13;
    var BTN_PAD = compactUI ? "6px 9px" : "10px 12px";
    var fmt = function (t) {
        if (!isFinite(t))
            return "0:00";
        var h = Math.floor(t / 3600);
        var m = Math.floor((t % 3600) / 60);
        var s = Math.floor(t % 60)
            .toString()
            .padStart(2, "0");
        return h > 0
            ? "".concat(h, ":").concat(m.toString().padStart(2, "0"), ":").concat(s)
            : "".concat(m, ":").concat(s);
    };
    /* ----- Perf hints: preconnect to video origins ----- */
    React.useEffect(function () {
        var add = function (url) {
            try {
                var u_1 = new URL(url);
                var existed = Array.from(document.querySelectorAll('link[rel="preconnect"]')).some(function (l) { return l.href === "".concat(u_1.origin, "/"); });
                if (!existed) {
                    var l = document.createElement("link");
                    l.rel = "preconnect";
                    l.href = u_1.origin;
                    l.crossOrigin = "anonymous";
                    document.head.appendChild(l);
                }
            }
            catch (_a) { }
        };
        if (srcMentor)
            add(srcMentor);
        if (srcDisplay)
            add(srcDisplay);
    }, [srcMentor, srcDisplay]);
    /* ----- UI hide/show ----- */
    var bumpUI = React.useCallback(function () {
        setShowUI(true);
        if (alwaysShowControls)
            return;
        window.clearTimeout(bumpUI._t);
        bumpUI._t = window.setTimeout(function () {
            if (!holdUI)
                setShowUI(false);
        }, autoHideMs);
    }, [autoHideMs, holdUI, alwaysShowControls]);
    React.useEffect(function () {
        if (alwaysShowControls)
            setShowUI(true);
    }, [alwaysShowControls]);
    /* ----- HLS attach + collect levels ----- */
    var attach = React.useCallback(function (el, url, holder, setLevels) { return __awaiter(_this, void 0, void 0, function () {
        var Hls, hls, refresh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!el || !url)
                        return [2 /*return*/];
                    if (holder.current) {
                        try {
                            holder.current.destroy();
                        }
                        catch (_b) { }
                        holder.current = null;
                    }
                    setErrorText(null);
                    if (!isHls(url)) {
                        el.src = url;
                        setLevels([]);
                        return [2 /*return*/];
                    }
                    if (nativeHls(el)) {
                        el.src = url;
                        setLevels([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, loadHls()];
                case 1:
                    Hls = _a.sent();
                    if (!Hls || !Hls.isSupported()) {
                        el.src = url;
                        setLevels([]);
                        return [2 /*return*/];
                    }
                    hls = new Hls({
                        lowLatencyMode: hlsLowLatency,
                        backBufferLength: 60,
                        startLevel: hlsPreferLowStart ? 0 : -1,
                        capLevelToPlayerSize: hlsCapToSize,
                        progressive: true,
                        maxBufferLength: 30,
                        maxMaxBufferLength: 120,
                        maxBufferSize: 60 * 1000 * 1000,
                        liveSyncDurationCount: 4,
                        fragLoadingTimeOut: 20000,
                        enableWorker: true,
                        xhrSetup: function (xhr) {
                            xhr.withCredentials = false;
                        },
                    });
                    holder.current = hls;
                    refresh = function () {
                        var hs = (hls.levels || [])
                            .map(function (L) { return (L === null || L === void 0 ? void 0 : L.height) || 0; })
                            .filter(Boolean)
                            .sort(function (a, b) { return b - a; });
                        setLevels(hs);
                    };
                    hls.on(Hls.Events.MANIFEST_PARSED, refresh);
                    hls.on(Hls.Events.LEVELS_UPDATED, refresh);
                    hls.on(Hls.Events.LEVEL_SWITCHED, refresh);
                    hls.on(Hls.Events.ERROR, function (_e, data) {
                        if (data === null || data === void 0 ? void 0 : data.fatal) {
                            if (data.type === "networkError" ||
                                data.details === "manifestLoadError") {
                                try {
                                    hls.startLoad();
                                }
                                catch (_a) { }
                            }
                            else if (data.type === "mediaError") {
                                try {
                                    hls.recoverMediaError();
                                }
                                catch (_b) { }
                            }
                            else {
                                setErrorText("HLS fatal error. Check CORS and source availability.");
                                try {
                                    hls.destroy();
                                }
                                catch (_c) { }
                                holder.current = null;
                            }
                        }
                    });
                    hls.attachMedia(el);
                    hls.loadSource(url);
                    return [2 /*return*/];
            }
        });
    }); }, [hlsCapToSize, hlsLowLatency, hlsPreferLowStart]);
    React.useEffect(function () {
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b || !srcMentor || !srcDisplay)
            return;
        attach(a, srcMentor, mentorHlsRef, setMentorLevels);
        attach(b, srcDisplay, displayHlsRef, setDisplayLevels);
        return function () {
            var _a, _b;
            try {
                (_a = mentorHlsRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
            }
            catch (_c) { }
            try {
                (_b = displayHlsRef.current) === null || _b === void 0 ? void 0 : _b.destroy();
            }
            catch (_d) { }
            mentorHlsRef.current = null;
            displayHlsRef.current = null;
        };
    }, [attach, srcMentor, srcDisplay]);
    /* ----- Start playback once ready (no restart on mute/loop) ----- */
    React.useEffect(function () {
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b || !srcMentor || !srcDisplay)
            return;
        var ready = function (v) {
            return new Promise(function (resolve) {
                if (v.readyState >= 2)
                    return resolve();
                var on = function () {
                    v.removeEventListener("canplay", on);
                    resolve();
                };
                v.addEventListener("canplay", on);
            });
        };
        (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([ready(a), ready(b)])];
                    case 1:
                        _a.sent();
                        a.currentTime = 0;
                        b.currentTime = 0;
                        setDuration(Math.max(a.duration || 0, b.duration || 0));
                        if (!autoplay) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.allSettled([a.play(), b.play()])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, [srcMentor, srcDisplay, autoplay]);
    // Apply mute/loop/volume without re-initializing sources
    React.useEffect(function () {
        if (mentorRef.current)
            mentorRef.current.muted = mentorMuted;
    }, [mentorMuted]);
    React.useEffect(function () {
        if (mentorRef.current)
            mentorRef.current.loop = loop;
        if (displayRef.current)
            displayRef.current.loop = loop;
    }, [loop]);
    React.useEffect(function () {
        if (mentorRef.current)
            mentorRef.current.volume = mentorVolume;
    }, [mentorVolume]);
    /* ----- Time + PiP + micro resync via rVFC when available ----- */
    React.useEffect(function () {
        var stop = false;
        var main = function () {
            return isMentorMain ? mentorRef.current : displayRef.current;
        };
        var other = function () {
            return isMentorMain ? displayRef.current : mentorRef.current;
        };
        var draw = function () {
            var m = main();
            var o = other();
            if (!m)
                return;
            setCurrent(m.currentTime || 0);
            // micro re-sync if drift > 120ms
            if (o &&
                Math.abs((o.currentTime || 0) - (m.currentTime || 0)) > 0.12) {
                try {
                    o.currentTime = m.currentTime || 0;
                }
                catch (_a) { }
            }
            // buffered percent
            if (showBuffered) {
                try {
                    var buf = m.buffered;
                    var end = 0;
                    for (var i = 0; i < buf.length; i++)
                        end = Math.max(end, buf.end(i));
                    var pct = duration
                        ? (Math.min(end, duration) / duration) * 100
                        : 0;
                    setBufferedPct(pct);
                }
                catch (_b) { }
            }
            // PiP canvas draw
            if (pip && pipCanvasRef.current && o && o.readyState >= 2) {
                var canvas = pipCanvasRef.current;
                var ctx = canvas.getContext("2d", {
                    willReadFrequently: true,
                });
                if (ctx) {
                    var vw = o.videoWidth || 16, vh = o.videoHeight || 9;
                    var cw = canvas.width, ch = canvas.height;
                    var vR = vw / vh, cR = cw / ch;
                    var dw = cw, dh = ch, dx = 0, dy = 0;
                    if (objectFit === "cover") {
                        if (vR > cR) {
                            dh = ch;
                            dw = ch * vR;
                            dx = (cw - dw) / 2;
                        }
                        else {
                            dw = cw;
                            dh = cw / vR;
                            dy = (ch - dh) / 2;
                        }
                    }
                    else {
                        if (vR > cR) {
                            dw = cw;
                            dh = cw / vR;
                            dy = (ch - dh) / 2;
                        }
                        else {
                            dh = ch;
                            dw = ch * vR;
                            dx = (cw - dw) / 2;
                        }
                    }
                    ctx.clearRect(0, 0, cw, ch);
                    try {
                        /* @ts-ignore */ ctx.drawImage(o, dx, dy, dw, dh);
                    }
                    catch (_c) { }
                }
            }
        };
        var m = main();
        // Prefer requestVideoFrameCallback for precise updates
        var rafId = null;
        var rvfcId = null;
        var loop = function () {
            if (stop)
                return;
            draw();
            rafId = requestAnimationFrame(loop);
        };
        if (m === null || m === void 0 ? void 0 : m.requestVideoFrameCallback) {
            var step_1 = function () {
                if (stop)
                    return;
                draw();
                rvfcId = m.requestVideoFrameCallback(step_1);
            };
            rvfcId = m.requestVideoFrameCallback(step_1);
        }
        else {
            rafId = requestAnimationFrame(loop);
        }
        var onWaiting = function () { return setIsBuffering(true); };
        var onPlaying = function () { return setIsBuffering(false); };
        m === null || m === void 0 ? void 0 : m.addEventListener("waiting", onWaiting);
        m === null || m === void 0 ? void 0 : m.addEventListener("playing", onPlaying);
        m === null || m === void 0 ? void 0 : m.addEventListener("canplay", onPlaying);
        return function () {
            stop = true;
            if (rafId)
                cancelAnimationFrame(rafId);
            if (rvfcId && (m === null || m === void 0 ? void 0 : m.cancelVideoFrameCallback)) {
                try {
                    ;
                    m.cancelVideoFrameCallback(rvfcId);
                }
                catch (_a) { }
            }
            m === null || m === void 0 ? void 0 : m.removeEventListener("waiting", onWaiting);
            m === null || m === void 0 ? void 0 : m.removeEventListener("playing", onPlaying);
            m === null || m === void 0 ? void 0 : m.removeEventListener("canplay", onPlaying);
        };
    }, [isMentorMain, pip, objectFit, showBuffered, duration]);
    /* ----- Auto-pause when offscreen ----- */
    React.useEffect(function () {
        if (!autoPauseOffscreen)
            return;
        var root = containerRef.current;
        if (!root)
            return;
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b)
            return;
        var wasPlaying = false;
        var io = new IntersectionObserver(function (entries) {
            var v = entries[0];
            if (!v)
                return;
            var visible = v.isIntersecting && v.intersectionRatio > 0.1;
            if (!visible) {
                wasPlaying = !(a.paused && b.paused);
                a.pause();
                b.pause();
            }
            else if (visible && wasPlaying) {
                a.play().catch(function () { });
                b.play().catch(function () { });
            }
        }, { threshold: [0, 0.1, 0.5, 1] });
        io.observe(root);
        return function () { return io.disconnect(); };
    }, [autoPauseOffscreen]);
    /* ----- Media Session (hardware keys / OS controls) ----- */
    React.useEffect(function () {
        var _a, _b, _c, _d, _f, _g, _h, _j;
        if (!("mediaSession" in navigator))
            return;
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b)
            return;
        (_b = (_a = navigator.mediaSession).setActionHandler) === null || _b === void 0 ? void 0 : _b.call(_a, "play", function () {
            a.play().catch(function () { });
            b.play().catch(function () { });
        });
        (_d = (_c = navigator.mediaSession).setActionHandler) === null || _d === void 0 ? void 0 : _d.call(_c, "pause", function () {
            a.pause();
            b.pause();
        });
        (_g = (_f = navigator.mediaSession).setActionHandler) === null || _g === void 0 ? void 0 : _g.call(_f, "seekbackward", function (d) {
            return seekBy(-((d === null || d === void 0 ? void 0 : d.seekOffset) || skipBig));
        });
        (_j = (_h = navigator.mediaSession).setActionHandler) === null || _j === void 0 ? void 0 : _j.call(_h, "seekforward", function (d) {
            return seekBy(+((d === null || d === void 0 ? void 0 : d.seekOffset) || skipBig));
        });
    }, [skipBig]);
    /* ----- Actions ----- */
    var playPause = function () {
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b)
            return;
        a.paused
            ? (a.play().catch(function () { }), b.play().catch(function () { }))
            : (a.pause(), b.pause());
    };
    var toggleMuteMentor = function () { return setMentorMuted(function (v) { return !v; }); };
    var setSpeed = function (r) {
        var idx = Math.max(0, SPEEDS.indexOf(r));
        var rate = idx >= 0 ? SPEEDS[idx] : 1;
        if (mentorRef.current)
            mentorRef.current.playbackRate = rate;
        if (displayRef.current)
            displayRef.current.playbackRate = rate;
        setRateIndex(Math.max(0, idx));
    };
    var cycleSpeed = function () { return setSpeed(SPEEDS[(rateIndex + 1) % SPEEDS.length]); };
    var incSpeed = function () {
        return setSpeed(SPEEDS[clamp(rateIndex + 1, 0, SPEEDS.length - 1)]);
    };
    var decSpeed = function () {
        return setSpeed(SPEEDS[clamp(rateIndex - 1, 0, SPEEDS.length - 1)]);
    };
    var seekTo = function (t) {
        var a = mentorRef.current, b = displayRef.current;
        if (!a || !b)
            return;
        var tt = clamp(t, 0, duration || 0);
        a.currentTime = tt;
        b.currentTime = tt;
        setCurrent(tt);
        if (enableDeepLinks && updateUrlOnSeek) {
            var url = new URL(window.location.href);
            url.searchParams.set("t", Math.floor(tt).toString());
            history.replaceState({}, "", url.toString());
        }
    };
    var seekBy = function (delta) {
        var _a, _b;
        return seekTo((isMentorMain
            ? ((_a = mentorRef.current) === null || _a === void 0 ? void 0 : _a.currentTime) || 0
            : ((_b = displayRef.current) === null || _b === void 0 ? void 0 : _b.currentTime) || 0) + delta);
    };
    var swapView = function () {
        setView(function (v) { return (v === "mentor" ? "display" : "mentor"); });
        bumpUI();
    };
    var setQualityForBoth = function (height) {
        setQuality(height);
        var apply = function (hls) {
            if (!hls || !hls.levels)
                return;
            if (height === -1) {
                hls.currentLevel = -1;
                return;
            }
            var idx = -1, best = Number.MAX_SAFE_INTEGER;
            hls.levels.forEach(function (L, i) {
                if (!(L === null || L === void 0 ? void 0 : L.height))
                    return;
                var d = Math.abs(L.height - height);
                if (d < best) {
                    best = d;
                    idx = i;
                }
            });
            if (idx >= 0)
                hls.currentLevel = idx;
        };
        apply(mentorHlsRef.current);
        apply(displayHlsRef.current);
    };
    /* ----- Deep links ----- */
    React.useEffect(function () {
        if (!enableDeepLinks)
            return;
        var parseFromUrl = function () {
            var _a, _b;
            var u = new URL(window.location.href);
            var q = u.searchParams.get("t");
            var h = (_a = u.hash.match(/t=([^&]+)/)) === null || _a === void 0 ? void 0 : _a[1];
            var raw = (_b = q !== null && q !== void 0 ? q : h) !== null && _b !== void 0 ? _b : null;
            if (!raw)
                return null;
            return parseTime(raw);
        };
        var t = parseFromUrl();
        if (t !== null)
            seekTo(t);
        var onHash = function () {
            var tt = parseFromUrl();
            if (tt !== null)
                seekTo(tt);
        };
        window.addEventListener("hashchange", onHash);
        return function () { return window.removeEventListener("hashchange", onHash); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableDeepLinks, duration]);
    /* ----- Keyboard + FS + Help + Native PiP ----- */
    React.useEffect(function () {
        var onKey = function (e) {
            var _a, _b, _c, _d;
            // Avoid typing inside inputs
            var tag = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.tagName) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            if (tag === "input" ||
                tag === "textarea" ||
                ((_c = e.target) === null || _c === void 0 ? void 0 : _c.isContentEditable))
                return;
            switch (e.key) {
                case " ":
                    e.preventDefault();
                    playPause();
                    break;
                case "m":
                case "M":
                    toggleMuteMentor();
                    break;
                case "t":
                case "T":
                    swapView();
                    break;
                case "f":
                case "F":
                    document.fullscreenElement
                        ? document.exitFullscreen()
                        : (_d = containerRef.current) === null || _d === void 0 ? void 0 : _d.requestFullscreen();
                    break;
                case "ArrowRight":
                    seekBy(e.shiftKey ? +skipSmall : +skipBig);
                    break;
                case "ArrowLeft":
                    seekBy(e.shiftKey ? -skipSmall : -skipBig);
                    break;
                case ",":
                    decSpeed();
                    break; // YouTube-style slower
                case ".":
                    incSpeed();
                    break; // faster
                case "j":
                case "J":
                    seekBy(-10);
                    break;
                case "l":
                case "L":
                    seekBy(+10);
                    break;
                case "k":
                case "K":
                    playPause();
                    break;
                case "c":
                case "C":
                    setPipCollapsed(function (v) { return !v; });
                    break;
                case "?":
                    if (keyboardHelpOverlay)
                        setShowHelp(function (v) { return !v; });
                    break;
                case "p":
                case "P":
                    if (enableNativePiP)
                        toggleNativePiP();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        var onFS = function () { return setIsFS(!!document.fullscreenElement); };
        document.addEventListener("fullscreenchange", onFS);
        return function () {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("fullscreenchange", onFS);
        };
    }, [isMentorMain, skipSmall, skipBig, keyboardHelpOverlay, enableNativePiP]);
    /* ----- Native Picture-in-Picture ----- */
    var toggleNativePiP = function () { return __awaiter(_this, void 0, void 0, function () {
        var target, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    if (!document.pictureInPictureEnabled)
                        return [2 /*return*/];
                    target = isMentorMain ? displayRef.current : mentorRef.current // pop out the secondary view
                    ;
                    nativePipTargetRef.current = target || null;
                    if (!document.pictureInPictureElement) return [3 /*break*/, 2];
                    // @ts-ignore
                    return [4 /*yield*/, document.exitPictureInPicture()];
                case 1:
                    // @ts-ignore
                    _d.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!target) return [3 /*break*/, 4];
                    // Some browsers require controls to be visible
                    ;
                    target.disablePictureInPicture = false;
                    // @ts-ignore
                    return [4 /*yield*/, ((_c = (_b = target).requestPictureInPicture) === null || _c === void 0 ? void 0 : _c.call(_b))];
                case 3:
                    // @ts-ignore
                    _d.sent();
                    _d.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    _a = _d.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    /* ----- PiP drag/resize with snap ----- */
    var drag = React.useRef({ startX: 0, startY: 0, baseX: 0, baseY: 0, dragging: false });
    var onPipDown = function (e) {
        e.preventDefault();
        e.stopPropagation();
        drag.current.dragging = true;
        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;
        drag.current.baseX = pipPos.x;
        drag.current.baseY = pipPos.y;
        e.target.setPointerCapture(e.pointerId);
    };
    var onPipMove = function (e) {
        var _a;
        if (!drag.current.dragging)
            return;
        var rect = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!rect)
            return;
        var dx = ((e.clientX - drag.current.startX) / rect.width) * 100;
        var dy = ((e.clientY - drag.current.startY) / rect.height) * 100;
        var maxW = 98 - pipSize;
        var maxH = 98 - (pipSize * 9) / 16;
        var x = clamp(drag.current.baseX + dx, 2, maxW);
        var y = clamp(drag.current.baseY + dy, 2, maxH);
        if (pipSnap) {
            var snap_1 = 3; // percent
            var corners = [2, maxW];
            corners.forEach(function (cx) {
                if (Math.abs(x - cx) < snap_1)
                    x = cx;
            });
            var ys = [2, maxH];
            ys.forEach(function (cy) {
                if (Math.abs(y - cy) < snap_1)
                    y = cy;
            });
        }
        setPipPos({ x: x, y: y });
    };
    var onPipUp = function () {
        drag.current.dragging = false;
        if (pipRememberPosition) {
            try {
                localStorage.setItem(storedKey, JSON.stringify(pipPos));
                localStorage.setItem(storedSizeKey, JSON.stringify(pipSize));
            }
            catch (_a) { }
        }
    };
    var onPipWheel = function (e) {
        if (!pipWheelResize)
            return;
        e.preventDefault();
        e.stopPropagation();
        var dir = e.deltaY > 0 ? -1 : 1;
        setPipSize(function (s) { return clamp(Math.round(s + dir * 2), pipMinPct, pipMaxPct); });
    };
    /* ----- Styles ----- */
    var container = {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "black",
        aspectRatio: aspect.replace(":", " / "),
        overflow: "hidden",
        borderRadius: 12,
        userSelect: "none",
    };
    var videoLayer = __assign({ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }, (debug ? { outline: "2px solid #00D1FF" } : {}));
    var vid = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: objectFit,
        transition: "opacity 160ms ease",
        backgroundColor: "black",
    };
    var backdrop = __assign({ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "auto" }, (debug ? { outline: "2px dashed #FF9F0A" } : {}));
    var controlsZ = 10;
    var barGrad = "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.7) 100%)";
    var controlsWrap = {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: alwaysShowControls
            ? "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.6) 100%)"
            : barGrad,
        padding: compactUI ? "8px 10px 10px" : "10px 12px 12px",
        opacity: showUI ? 1 : 0,
        transition: "opacity 140ms linear",
        zIndex: controlsZ,
        pointerEvents: "auto",
    };
    var stopBubble = function (e) { return e.stopPropagation(); };
    var kill = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ne = e.nativeEvent;
        if (ne === null || ne === void 0 ? void 0 : ne.stopImmediatePropagation)
            ne.stopImmediatePropagation();
    };
    var Btn = function (_a) {
        var onFire = _a.onFire, title = _a.title, children = _a.children;
        return (React.createElement("button", { title: title, onPointerDownCapture: kill, onPointerUpCapture: function (e) {
                kill(e);
                onFire();
            }, onClick: kill, style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: BTN_PAD,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                color: "white",
                fontSize: FONT,
                lineHeight: 1,
                cursor: "pointer",
                touchAction: "none",
            }, "aria-label": title }, children));
    };
    var pipWidth = "".concat(clamp(pipSize, pipMinPct, pipMaxPct), "%");
    var pipStyle = {
        position: "absolute",
        left: "".concat(pipPos.x, "%"),
        top: "".concat(pipPos.y, "%"),
        width: pipWidth,
        aspectRatio: "16/9",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.2)",
        zIndex: controlsZ + 1,
        cursor: "grab",
        touchAction: "none",
        transition: "opacity 120ms ease, transform 120ms ease",
        opacity: pipCollapsed ? 0.85 : 1,
        transform: pipCollapsed ? "scale(0.78)" : "scale(1)",
    };
    /* ===== Render ===== */
    return (React.createElement("div", { ref: containerRef, style: container, onMouseMove: bumpUI, onMouseLeave: function () { return !alwaysShowControls && setShowUI(false); } },
        React.createElement("div", { style: videoLayer },
            React.createElement("video", { ref: mentorRef, crossOrigin: "anonymous", muted: mentorMuted, playsInline: true, preload: "auto", style: __assign(__assign({}, vid), { opacity: isMentorMain ? 1 : 0 }) }),
            React.createElement("video", { ref: displayRef, crossOrigin: "anonymous", muted: true, playsInline: true, preload: "auto", style: __assign(__assign({}, vid), { opacity: isMentorMain ? 0 : 1 }) })),
        React.createElement("div", { style: backdrop, onPointerUp: playPause }),
        pip && (React.createElement("div", { onPointerDown: onPipDown, onPointerMove: onPipMove, onPointerUp: onPipUp, onWheel: onPipWheel, style: pipStyle, title: "Drag to move \u2022 Scroll to resize \u2022 Click to swap \u2022 Double-click to collapse", onDoubleClick: function () { return setPipCollapsed(function (v) { return !v; }); }, onClick: function (e) {
                e.stopPropagation();
                swapView();
            } }, !pipCollapsed ? (React.createElement(React.Fragment, null,
            React.createElement("canvas", { ref: pipCanvasRef, width: 640, height: 360, style: {
                    width: "100%",
                    height: "100%",
                    display: "block",
                } }),
            React.createElement("div", { style: {
                    position: "absolute",
                    left: 6,
                    top: 6,
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: 11,
                    color: "white",
                    background: accent,
                } }, isMentorMain ? "Display View" : "Mentor View"),
            React.createElement("div", { style: {
                    position: "absolute",
                    right: 6,
                    top: 6,
                    display: "flex",
                    gap: 6,
                } },
                React.createElement("button", { onClick: function (e) {
                        e.stopPropagation();
                        setPipCollapsed(true);
                    }, style: {
                        padding: "4px 6px",
                        borderRadius: 8,
                        background: "rgba(0,0,0,.55)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.18)",
                        cursor: "pointer",
                    } }, "\u2212")))) : (React.createElement("div", { style: {
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                background: "rgba(0,0,0,.35)",
            } },
            React.createElement("button", { onClick: function (e) {
                    e.stopPropagation();
                    setPipCollapsed(false);
                }, style: {
                    padding: "4px 8px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,.6)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.2)",
                    cursor: "pointer",
                } }, "Expand"))))),
        React.createElement("div", { style: controlsWrap, onPointerDownCapture: stopBubble, onClick: stopBubble, onWheel: function (e) {
                var _a, _b;
                e.preventDefault();
                e.stopPropagation();
                var delta = e.shiftKey ? skipSmall : skipBig;
                var dir = e.deltaY > 0 ? 1 : -1;
                var base = isMentorMain
                    ? ((_a = mentorRef.current) === null || _a === void 0 ? void 0 : _a.currentTime) || 0
                    : ((_b = displayRef.current) === null || _b === void 0 ? void 0 : _b.currentTime) || 0;
                seekTo(base + dir * delta);
            }, onMouseEnter: function () {
                setHoldUI(true);
            }, onMouseLeave: function () {
                setHoldUI(false);
                bumpUI();
            } },
            React.createElement("div", { style: {
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                } },
                React.createElement("span", { style: {
                        color: "#fff",
                        fontSize: 12,
                        minWidth: 46,
                        textAlign: "right",
                    } }, fmt(current)),
                React.createElement("div", { style: { position: "relative", flex: 1 } },
                    showBuffered && (React.createElement("div", { style: {
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: compactUI ? 6 : 8,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.2)",
                        } })),
                    showBuffered && (React.createElement("div", { style: {
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: compactUI ? 6 : 8,
                            width: "".concat(bufferedPct, "%"),
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.45)",
                            transition: "width .2s linear",
                        } })),
                    React.createElement("input", { type: "range", min: 0, max: duration || 0, step: 0.05, value: Math.min(current, duration || 0), onInput: function (e) {
                            return seekTo(parseFloat(e.target.value));
                        }, onChange: function (e) {
                            return seekTo(parseFloat(e.target.value));
                        }, style: {
                            position: "relative",
                            zIndex: 2,
                            width: "100%",
                            appearance: "none",
                            height: compactUI ? 6 : 8,
                            borderRadius: 999,
                            background: "linear-gradient(90deg, ".concat(accent, " ").concat(duration ? (current / duration) * 100 : 0, "%, rgba(255,255,255,0) 0)"),
                            outline: "none",
                            touchAction: "none",
                            cursor: "pointer",
                        }, "aria-label": "Seek" }),
                    chapters.length > 0 && (React.createElement("div", { style: {
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: compactUI ? 8 : 10,
                            height: 10,
                            zIndex: 3,
                        } }, chapters.map(function (c, i) {
                        var leftPct = duration
                            ? (c.t / duration) * 100
                            : 0;
                        return (React.createElement("div", { key: i, title: "".concat(c.label, " \u2022 ").concat(fmt(c.t)), onMouseEnter: function () {
                                return setTooltip({
                                    leftPct: leftPct,
                                    text: "".concat(c.label, " \u2022 ").concat(fmt(c.t)),
                                });
                            }, onMouseLeave: function () {
                                return setTooltip(null);
                            }, onClick: function () { return seekTo(c.t); }, style: {
                                position: "absolute",
                                left: "calc(".concat(leftPct, "% - 1px)"),
                                bottom: 0,
                                width: 2,
                                height: 8,
                                borderRadius: 2,
                                background: "rgba(255,255,255,.9)",
                                cursor: "pointer",
                            } }));
                    })))),
                React.createElement("span", { style: { color: "#fff", fontSize: 12, minWidth: 46 } }, fmt(duration))),
            React.createElement("div", { style: {
                    marginTop: compactUI ? 6 : 10,
                    display: "flex",
                    alignItems: "center",
                    gap: compactUI ? 8 : 10,
                } },
                React.createElement(Btn, { onFire: function () { return seekBy(-skipBig); }, title: "Back ".concat(skipBig, "s") },
                    React.createElement(Icon.Back10, null)),
                React.createElement(Btn, { onFire: playPause, title: "Play/Pause (Space)" }, (isMentorMain
                    ? (_b = mentorRef.current) === null || _b === void 0 ? void 0 : _b.paused
                    : (_c = displayRef.current) === null || _c === void 0 ? void 0 : _c.paused) ? (React.createElement(Icon.Play, null)) : (React.createElement(Icon.Pause, null))),
                React.createElement(Btn, { onFire: function () { return seekBy(+skipBig); }, title: "Forward ".concat(skipBig, "s") },
                    React.createElement(Icon.Fwd10, null)),
                React.createElement(Btn, { onFire: cycleSpeed, title: "Speed" },
                    React.createElement(Icon.Speed, null),
                    React.createElement("span", null,
                        SPEEDS[rateIndex],
                        "\u00D7")),
                React.createElement(Btn, { onFire: toggleMuteMentor, title: "Mute/Unmute Mentor (M)" }, mentorMuted ? React.createElement(Icon.Mute, null) : React.createElement(Icon.Volume, null)),
                showVolumeSlider && (React.createElement("input", { type: "range", min: 0, max: 1, step: 0.02, value: mentorMuted ? 0 : mentorVolume, onInput: function (e) {
                        var v = parseFloat(e.target.value);
                        setMentorVolume(v);
                        if (v === 0 && !mentorMuted)
                            setMentorMuted(true);
                        if (v > 0 && mentorMuted)
                            setMentorMuted(false);
                    }, "aria-label": "Volume", style: {
                        width: 90,
                        height: 6,
                        appearance: "none",
                        background: "rgba(255,255,255,.25)",
                        borderRadius: 999,
                    } })),
                React.createElement(Btn, { onFire: swapView, title: "Swap View (T)" },
                    React.createElement(Icon.Swap, null)),
                chapters.length > 0 && (React.createElement("div", { style: { position: "relative" } },
                    React.createElement(Btn, { onFire: function () { return setChaptersOpen(function (o) { return !o; }); }, title: "Chapters" },
                        React.createElement(Icon.Chapter, null)),
                    chaptersOpen && (React.createElement("div", { onMouseEnter: function () { return setHoldUI(true); }, onMouseLeave: function () {
                            setHoldUI(false);
                            setChaptersOpen(false);
                            bumpUI();
                        }, style: {
                            position: "absolute",
                            left: 0,
                            bottom: "calc(100% + 8px)",
                            minWidth: 220,
                            maxHeight: 220,
                            overflow: "auto",
                            background: "rgba(0,0,0,.8)",
                            color: "#fff",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,.2)",
                            padding: 8,
                            zIndex: 50,
                        } }, chapters.map(function (c, i) { return (React.createElement("button", { key: i, onClick: function (e) {
                            e.preventDefault();
                            seekTo(c.t);
                            setChaptersOpen(false);
                        }, style: {
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "transparent",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 8px",
                            borderRadius: 8,
                            fontSize: FONT,
                        } },
                        React.createElement("span", { style: { opacity: 0.9 } }, c.label),
                        React.createElement("span", { style: { opacity: 0.6 } }, fmt(c.t)))); }))))),
                anyHls && (React.createElement("div", { style: { position: "relative" } },
                    React.createElement(Btn, { onFire: function () { return setQOpen(function (o) { return !o; }); }, title: "Quality" },
                        React.createElement(Icon.Quality, null),
                        React.createElement("span", null, quality === -1 ? "Auto" : "".concat(quality, "p"))),
                    qOpen && (React.createElement("div", { onMouseEnter: function () { return setHoldUI(true); }, onMouseLeave: function () {
                            setHoldUI(false);
                            setQOpen(false);
                            bumpUI();
                        }, style: {
                            position: "absolute",
                            left: 0,
                            bottom: "calc(100% + 8px)",
                            minWidth: 140,
                            background: "rgba(0,0,0,.8)",
                            color: "#fff",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,.2)",
                            padding: 6,
                            zIndex: 50,
                        } },
                        React.createElement("button", { onClick: function () {
                                setQualityForBoth(-1);
                                setQOpen(false);
                            }, style: {
                                width: "100%",
                                textAlign: "left",
                                padding: "6px 8px",
                                background: "transparent",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 8,
                                fontSize: FONT,
                                opacity: 0.95,
                            } }, "Auto"),
                        qualities.length === 0 && (React.createElement("div", { style: {
                                padding: "6px 8px",
                                opacity: 0.65,
                                fontSize: FONT,
                            } }, "Auto (native or single quality)")),
                        qualities.map(function (h) { return (React.createElement("button", { key: h, onClick: function () {
                                setQualityForBoth(h);
                                setQOpen(false);
                            }, style: {
                                width: "100%",
                                textAlign: "left",
                                padding: "6px 8px",
                                background: "transparent",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 8,
                                fontSize: FONT,
                            } },
                            h,
                            "p")); }))))),
                enableNativePiP && (React.createElement(Btn, { onFire: toggleNativePiP, title: "Pop-out Secondary (PiP)" },
                    React.createElement(Icon.PopOut, null))),
                React.createElement(Btn, { onFire: function () {
                        var _a;
                        try {
                            var url = new URL(window.location.href);
                            url.searchParams.set("t", Math.floor(current).toString());
                            (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(url.toString());
                        }
                        catch (_b) { }
                    }, title: "Copy link to current time" },
                    React.createElement(Icon.Link, null)),
                React.createElement("div", { style: { marginLeft: "auto" } },
                    React.createElement(Btn, { onFire: function () {
                            var _a;
                            return document.fullscreenElement
                                ? document.exitFullscreen()
                                : (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.requestFullscreen();
                        }, title: isFS ? "Exit Fullscreen (F)" : "Fullscreen (F)" }, isFS ? React.createElement(Icon.FSExit, null) : React.createElement(Icon.FS, null))))),
        tooltip && (React.createElement("div", { style: {
                position: "absolute",
                left: "".concat(tooltip.leftPct, "%"),
                bottom: compactUI ? 44 : 56,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                zIndex: 60,
            } },
            React.createElement("div", { style: {
                    background: "rgba(0,0,0,.85)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 8,
                    padding: "3px 8px",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                } }, tooltip.text))),
        isBuffering && !errorText && (React.createElement("div", { style: {
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 12,
                pointerEvents: "none",
            } },
            React.createElement("div", { style: {
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.25)",
                    borderTopColor: accent,
                    animation: "spin .9s linear infinite",
                } }),
            React.createElement("style", null, "@keyframes spin { to { transform: rotate(360deg) } }"))),
        errorText && (React.createElement("div", { style: {
                position: "absolute",
                inset: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                pointerEvents: "none",
            } },
            React.createElement("div", { style: {
                    maxWidth: 640,
                    width: "100%",
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    border: "1px solid rgba(255,255,255,0.2)",
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                } }, errorText))),
        keyboardHelpOverlay && showHelp && (React.createElement("div", { onClick: function () { return setShowHelp(false); }, style: {
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 100,
                display: "grid",
                placeItems: "center",
                color: "#fff",
            } },
            React.createElement("div", { style: {
                    background: "rgba(0,0,0,0.75)",
                    border: "1px solid rgba(255,255,255,.2)",
                    padding: 16,
                    borderRadius: 12,
                    maxWidth: 640,
                    width: "90%",
                    fontSize: 13,
                } },
                React.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, "Keyboard Shortcuts"),
                React.createElement("ul", { style: {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                    } },
                    React.createElement("li", null,
                        React.createElement("b", null, "Space / K"),
                        " \u2014 Play/Pause"),
                    React.createElement("li", null,
                        React.createElement("b", null, "M"),
                        " \u2014 Mute/Unmute"),
                    React.createElement("li", null,
                        React.createElement("b", null, "J / L"),
                        " \u2014 \u2212/+10s"),
                    React.createElement("li", null,
                        React.createElement("b", null, "\u2190 / \u2192"),
                        " \u2014 \u2212/+",
                        skipBig,
                        "s (",
                        skipSmall,
                        "s with Shift)"),
                    React.createElement("li", null,
                        React.createElement("b", null, ", / ."),
                        " \u2014 Slower/Faster"),
                    React.createElement("li", null,
                        React.createElement("b", null, "T"),
                        " \u2014 Swap Views"),
                    React.createElement("li", null,
                        React.createElement("b", null, "C"),
                        " \u2014 Collapse/Expand PiP"),
                    React.createElement("li", null,
                        React.createElement("b", null, "F"),
                        " \u2014 Fullscreen"),
                    enableNativePiP && (React.createElement("li", null,
                        React.createElement("b", null, "P"),
                        " \u2014 Pop-out Secondary (native PiP)")),
                    React.createElement("li", null,
                        React.createElement("b", null, "?"),
                        " \u2014 Toggle this help")))))));
}
DualViewPlayer_v4_0.displayName = "Dual View Player v4.0";
/* ===== Framer Controls ===== */
(0, framer_1.addPropertyControls)(DualViewPlayer_v4_0, {
    mentorHtml: {
        title: "Mentor Video HTML",
        type: framer_1.ControlType.String,
        placeholder: "Paste <video>…</video> or https://…/mentor.m3u8",
    },
    displayHtml: {
        title: "Display Video HTML",
        type: framer_1.ControlType.String,
        placeholder: "Paste <video>…</video> or https://…/display.m3u8",
    },
    instanceId: {
        title: "Instance ID",
        type: framer_1.ControlType.String,
        defaultValue: "dualview",
    },
    startView: {
        title: "Start View",
        type: framer_1.ControlType.SegmentedEnum,
        options: ["mentor", "display"],
        optionTitles: ["Mentor", "Display"],
        defaultValue: "mentor",
    },
    autoplay: {
        title: "Autoplay",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    muted: {
        title: "Mute Mentor",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    loop: { title: "Loop", type: framer_1.ControlType.Boolean, defaultValue: false },
    objectFit: {
        title: "Object Fit",
        type: framer_1.ControlType.SegmentedEnum,
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        defaultValue: "cover",
    },
    aspect: {
        title: "Aspect",
        type: framer_1.ControlType.Enum,
        options: ["16:9", "4:3", "1:1"],
        optionTitles: ["16:9", "4:3", "1:1"],
        defaultValue: "16:9",
    },
    accent: {
        title: "Accent",
        type: framer_1.ControlType.Color,
        defaultValue: "#7C3AED",
    },
    compactUI: {
        title: "Compact UI",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    autoHideMs: {
        title: "Autohide (ms)",
        type: framer_1.ControlType.Number,
        min: 800,
        max: 8000,
        step: 100,
        defaultValue: 3200,
    },
    alwaysShowControls: {
        title: "Always Show Controls",
        type: framer_1.ControlType.Boolean,
        defaultValue: false,
    },
    pip: {
        title: "Mini Preview",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    pipSizePct: {
        title: "Mini Size % (initial)",
        type: framer_1.ControlType.Number,
        min: 12,
        max: 44,
        step: 1,
        defaultValue: 24,
    },
    pipMinPct: {
        title: "Mini Min %",
        type: framer_1.ControlType.Number,
        min: 8,
        max: 30,
        step: 1,
        defaultValue: 12,
    },
    pipMaxPct: {
        title: "Mini Max %",
        type: framer_1.ControlType.Number,
        min: 30,
        max: 60,
        step: 1,
        defaultValue: 44,
    },
    pipStartCorner: {
        title: "PiP Corner",
        type: framer_1.ControlType.SegmentedEnum,
        options: ["br", "bl", "tr", "tl"],
        optionTitles: ["BR", "BL", "TR", "TL"],
        defaultValue: "br",
    },
    pipRememberPosition: {
        title: "Remember Position",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    pipSnap: {
        title: "Snap to Corners",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    pipWheelResize: {
        title: "Wheel Resize PiP",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    timestamps: {
        title: "Timestamps",
        type: framer_1.ControlType.Array,
        propertyControl: {
            type: framer_1.ControlType.Object,
            controls: {
                label: { type: framer_1.ControlType.String, title: "Label" },
                time: {
                    type: framer_1.ControlType.String,
                    title: "Time (1:23 / 83 / 1m23s)",
                },
            },
        },
    },
    enableDeepLinks: {
        title: "Enable Deep Links",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    updateUrlOnSeek: {
        title: "Update URL on Seek",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    skipSmall: {
        title: "Skip Small (s)",
        type: framer_1.ControlType.Number,
        min: 0.1,
        max: 2,
        step: 0.05,
        defaultValue: 0.25,
    },
    skipBig: {
        title: "Skip Big (s)",
        type: framer_1.ControlType.Number,
        min: 3,
        max: 15,
        step: 1,
        defaultValue: 5,
    },
    showBuffered: {
        title: "Show Buffered",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    showVolumeSlider: {
        title: "Show Volume Slider",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    keyboardHelpOverlay: {
        title: "Keyboard Help Overlay",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    autoPauseOffscreen: {
        title: "Auto Pause Offscreen",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    hlsLowLatency: {
        title: "HLS Low Latency",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    hlsPreferLowStart: {
        title: "Prefer Low Start",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    hlsCapToSize: {
        title: "Cap Level to Player Size",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    enableNativePiP: {
        title: "Enable Native PiP",
        type: framer_1.ControlType.Boolean,
        defaultValue: true,
    },
    debug: {
        title: "Debug Outlines",
        type: framer_1.ControlType.Boolean,
        defaultValue: false,
    },
});
