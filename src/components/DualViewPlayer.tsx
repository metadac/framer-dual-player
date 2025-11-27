import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/* ===== Types & Props ===== */
type View = "mentor" | "display"
type TimestampItem = { label: string; time: string }
type Chapter = { label: string; t: number }
type MaybeHls = any

type Props = {
    mentorHtml?: string // <video>…</video> or URL (.mp4 / .m3u8)
    displayHtml?: string

    instanceId?: string

    startView?: View
    autoplay?: boolean
    muted?: boolean // mentor only; display always muted
    loop?: boolean

    objectFit?: "cover" | "contain"
    aspect?: "16:9" | "4:3" | "1:1"
    accent?: string

    compactUI?: boolean
    autoHideMs?: number
    alwaysShowControls?: boolean

    pip?: boolean
    pipSizePct?: number // 12–44
    pipStartCorner?: "br" | "bl" | "tr" | "tl"
    pipRememberPosition?: boolean
    pipSnap?: boolean // snap to corners/edges when close
    pipWheelResize?: boolean // allow wheel resize over PiP
    pipMinPct?: number // 12
    pipMaxPct?: number // 44

    timestamps?: TimestampItem[] // [{label:"Intro", time:"0:00"}, …]
    enableDeepLinks?: boolean
    updateUrlOnSeek?: boolean

    // Enhancements
    skipSmall?: number // shift-scrub or arrows with Shift (s)
    skipBig?: number // default 5s
    showBuffered?: boolean // show buffered range behind seek
    showVolumeSlider?: boolean // mentor audio volume slider
    keyboardHelpOverlay?: boolean // show "?" help sheet
    autoPauseOffscreen?: boolean // pause when scrolled away

    // HLS/ABR tuning
    hlsLowLatency?: boolean
    hlsPreferLowStart?: boolean // start at lowest level for instant start
    hlsCapToSize?: boolean // cap to player size

    // Native Picture-in-Picture (pop-out window)
    enableNativePiP?: boolean // toggle native PiP for the main video

    debug?: boolean
}

/* ===== Helpers ===== */
const SPEEDS = [0.5, 1, 1.25, 1.5, 1.75, 2] as const

const isHls = (u: string) => /\.m3u8($|\?)/i.test(u)
const nativeHls = (video: HTMLVideoElement) =>
    video.canPlayType("application/vnd.apple.mpegurl") !== ""

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

function extractSrc(html?: string): string {
    if (!html) return ""
    const t = html.trim()
    if (/^https?:\/\//i.test(t)) return t
    try {
        const doc = new DOMParser().parseFromString(t, "text/html")
        const s = doc.querySelector("source[src]") as HTMLSourceElement | null
        if (s?.src) return s.src
        const v = doc.querySelector("video[src]") as HTMLVideoElement | null
        if (v?.src) return v.src
    } catch {}
    return ""
}

function parseTime(text: string): number | null {
    const s = (text || "").trim()
    if (!s) return null
    if (/^\d+$/.test(s)) return parseInt(s, 10)
    const clock = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
    if (clock) {
        const h = clock[3] ? parseInt(clock[1], 10) : 0
        const m = clock[3] ? parseInt(clock[2], 10) : parseInt(clock[1], 10)
        const sec = parseInt(clock[3] || clock[2], 10)
        return h * 3600 + m * 60 + sec
    }
    const words = s.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i)
    if (words && (words[1] || words[2] || words[3])) {
        const h = parseInt(words[1] || "0", 10)
        const m = parseInt(words[2] || "0", 10)
        const sec = parseInt(words[3] || "0", 10)
        return h * 3600 + m * 60 + sec
    }
    return null
}

function chaptersFromArray(items?: TimestampItem[]): Chapter[] {
    if (!items) return []
    return items
        .map((it) => {
            const t = parseTime(it.time)
            if (t === null) return null
            return { label: (it.label || "").trim() || `${t}s`, t }
        })
        .filter((x): x is Chapter => !!x)
        .sort((a, b) => a.t - b.t)
}

let hlsLoading: Promise<MaybeHls | null> | null = null
function loadHls(): Promise<MaybeHls | null> {
    if ((window as any).Hls) return Promise.resolve((window as any).Hls)
    if (hlsLoading) return hlsLoading
    hlsLoading = new Promise((resolve) => {
        const s = document.createElement("script")
        s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js"
        s.async = true
        s.onload = () => resolve((window as any).Hls || null)
        s.onerror = () => resolve(null)
        document.head.appendChild(s)
    })
    return hlsLoading
}

/* ===== Icons (compact) ===== */
const Icon = {
    Play: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
    ),
    Pause: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
    ),
    Volume: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5 10v4h4l5 4V6l-5 4H5z" />
        </svg>
    ),
    Mute: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M3 9v6h4l5 4V5L7 9H3zM19 7l-1.4-1.4-3.6 3.6-3.6-3.6L9 7l3.6 3.6L9 14.2 10.4 15.6 14 12l3.6 3.6 1.4-1.4L15.4 10.6 19 7z"
            />
        </svg>
    ),
    Speed: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm1 1v7l5 3 .9-1.8-4.4-2.6V5z"
            />
        </svg>
    ),
    Swap: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M7 7h11v2H7l3 3-1.4 1.4L3.2 8l5.4-5.4L10 4 7 7zm10 10H6v-2h11l-3-3 1.4-1.4 5.4 5.4-5.4 5.4L14 20l3-3z"
            />
        </svg>
    ),
    FS: () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 10V5a1 1 0 0 1 1-1h5" />
            <path d="M20 10V5a1 1 0 0 0-1-1h-5" />
            <path d="M4 14v5a1 1 0 0 0 1 1h5" />
            <path d="M20 14v5a1 1 0 0 1-1 1h-5" />
        </svg>
    ),
    FSExit: () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 4H5a1 1 0 0 0-1 1v4" />
            <path d="M15 4h4a1 1 0 0 1 1 1v4" />
            <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
            <path d="M15 20h4a1 1 0 0 0 1-1v-4" />
        </svg>
    ),
    Chapter: () => (
        <svg width="14" height="14" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M5 4h14v2H5zm0 6h14v2H5zm0 6h10v2H5z"
            />
        </svg>
    ),
    Quality: () => (
        <svg width="14" height="14" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
            />
        </svg>
    ),
    Prev: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 12l8-8v6h4v4h-4v6z" />
        </svg>
    ),
    Next: () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ transform: "scaleX(-1)" }}
        >
            <path fill="currentColor" d="M6 12l8-8v6h4v4h-4v6z" />
        </svg>
    ),
    Back10: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M11 5V2L6 7l5 5V9c2.76 0 5 2.24 5 5a5 5 0 1 1-5-5z"
            />
        </svg>
    ),
    Fwd10: () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ transform: "scaleX(-1)" }}
        >
            <path
                fill="currentColor"
                d="M11 5V2L6 7l5 5V9c2.76 0 5 2.24 5 5a5 5 0 1 1-5-5z"
            />
        </svg>
    ),
    PopOut: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V3zM5 5h7v2H7v10h10v-5h2v7H5V5z"
            />
        </svg>
    ),
    Link: () => (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5zm7.1 1h2v-2h-2v2zm4-6h3a5 5 0 0 1 0 10h-3v-2h3a3 3 0 1 0 0-6h-3V7z"
            />
        </svg>
    ),
}

/* ===== Constants ===== */
const STANDARD_RESOLUTIONS = [1080, 720, 540, 360, 240]

/* ===== Component ===== */
export default function DualViewPlayer_v4_0({
    mentorHtml,
    displayHtml,
    instanceId = "dualview",
    startView = "mentor",
    autoplay = true,
    muted = true,
    loop = false,
    objectFit = "cover",
    aspect = "16:9",
    accent = "#7C3AED",
    compactUI = true,
    autoHideMs = 3200,
    alwaysShowControls = false,
    pip = true,
    pipSizePct = 24,
    pipStartCorner = "br",
    pipRememberPosition = true,
    pipSnap = true,
    pipWheelResize = true,
    pipMinPct = 12,
    pipMaxPct = 44,
    timestamps = [],
    enableDeepLinks = true,
    updateUrlOnSeek = true,
    skipSmall = 0.25,
    skipBig = 5,
    showBuffered = true,
    showVolumeSlider = true,
    keyboardHelpOverlay = true,
    autoPauseOffscreen = true,
    hlsLowLatency = true,
    hlsPreferLowStart = true,
    hlsCapToSize = true,
    enableNativePiP = true,
    debug = false,
}: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const mentorRef = React.useRef<HTMLVideoElement>(null)
    const displayRef = React.useRef<HTMLVideoElement>(null)
    const pipCanvasRef = React.useRef<HTMLCanvasElement>(null)

    const mentorHlsRef = React.useRef<MaybeHls | null>(null)
    const displayHlsRef = React.useRef<MaybeHls | null>(null)
    const nativePipTargetRef = React.useRef<HTMLVideoElement | null>(null)

    const [view, setView] = React.useState<View>(startView)
    const [rateIndex, setRateIndex] = React.useState(1)
    const [mentorMuted, setMentorMuted] = React.useState(!!muted)
    const [mentorVolume, setMentorVolume] = React.useState(1)
    const [duration, setDuration] = React.useState(0)
    const [current, setCurrent] = React.useState(0)
    const [showUI, setShowUI] = React.useState(true)
    const [holdUI, setHoldUI] = React.useState(false)
    const [isFS, setIsFS] = React.useState(false)
    const [isBuffering, setIsBuffering] = React.useState(false)
    const [errorText, setErrorText] = React.useState<string | null>(null)
    const [bufferedPct, setBufferedPct] = React.useState(0)
    const [showHelp, setShowHelp] = React.useState(false)

    // Chapters
    const chapters = React.useMemo(
        () => chaptersFromArray(timestamps),
        [timestamps]
    )
    const [tooltip, setTooltip] = React.useState<{
        leftPct: number
        text: string
    } | null>(null)

    // Quality state
    const [mentorLevels, setMentorLevels] = React.useState<number[]>([])
    const [displayLevels, setDisplayLevels] = React.useState<number[]>([])
    const qualities = React.useMemo(
        () =>
            Array.from(
                new Set([
                    ...mentorLevels,
                    ...displayLevels,
                    ...STANDARD_RESOLUTIONS,
                ])
            ).sort((a, b) => b - a),
        [mentorLevels, displayLevels]
    )
    const [quality, setQuality] = React.useState<number | -1>(-1)
    const [qOpen, setQOpen] = React.useState(false)
    const anyHls =
        isHls(extractSrc(mentorHtml)) || isHls(extractSrc(displayHtml))

    // Chapters popover
    const [chaptersOpen, setChaptersOpen] = React.useState(false)

    // PiP placement
    const storedKey = `dvp.${instanceId}.pip`
    const storedSizeKey = `dvp.${instanceId}.pip.size`
    const defaultPos = React.useMemo(() => {
        switch (pipStartCorner) {
            case "bl":
                return { x: 6, y: 88 }
            case "tr":
                return { x: 88, y: 6 }
            case "tl":
                return { x: 6, y: 6 }
            default:
                return { x: 88, y: 88 }
        }
    }, [pipStartCorner])
    const [pipPos, setPipPos] = React.useState<{ x: number; y: number }>(() => {
        if (pipRememberPosition) {
            try {
                const s = localStorage.getItem(storedKey)
                if (s) return JSON.parse(s)
            } catch {}
        }
        return defaultPos
    })
    const [pipSize, setPipSize] = React.useState<number>(() => {
        if (pipRememberPosition) {
            try {
                const s = localStorage.getItem(storedSizeKey)
                if (s) return JSON.parse(s)
            } catch {}
        }
        return pipSizePct
    })
    const [pipCollapsed, setPipCollapsed] = React.useState(false)

    const srcMentor = extractSrc(mentorHtml)
    const srcDisplay = extractSrc(displayHtml)
    const isMentorMain = view === "mentor"

    const FONT = compactUI ? 12 : 13
    const BTN_PAD = compactUI ? "6px 9px" : "10px 12px"

    const fmt = (t: number) => {
        if (!isFinite(t)) return "0:00"
        const h = Math.floor(t / 3600)
        const m = Math.floor((t % 3600) / 60)
        const s = Math.floor(t % 60)
            .toString()
            .padStart(2, "0")
        return h > 0
            ? `${h}:${m.toString().padStart(2, "0")}:${s}`
            : `${m}:${s}`
    }

    /* ----- Perf hints: preconnect to video origins ----- */
    React.useEffect(() => {
        const add = (url: string) => {
            try {
                const u = new URL(url)
                const existed = Array.from(
                    document.querySelectorAll<HTMLLinkElement>(
                        'link[rel="preconnect"]'
                    )
                ).some((l) => l.href === `${u.origin}/`)
                if (!existed) {
                    const l = document.createElement("link")
                    l.rel = "preconnect"
                    l.href = u.origin
                    l.crossOrigin = "anonymous"
                    document.head.appendChild(l)
                }
            } catch {}
        }
        if (srcMentor) add(srcMentor)
        if (srcDisplay) add(srcDisplay)
    }, [srcMentor, srcDisplay])

    /* ----- UI hide/show ----- */
    const bumpUI = React.useCallback(() => {
        setShowUI(true)
        if (alwaysShowControls) return
        window.clearTimeout((bumpUI as any)._t)
        ;(bumpUI as any)._t = window.setTimeout(() => {
            if (!holdUI) setShowUI(false)
        }, autoHideMs)
    }, [autoHideMs, holdUI, alwaysShowControls])

    React.useEffect(() => {
        if (alwaysShowControls) setShowUI(true)
    }, [alwaysShowControls])

    /* ----- HLS attach + collect levels ----- */
    const attach = React.useCallback(
        async (
            el: HTMLVideoElement | null,
            url: string,
            holder: React.MutableRefObject<MaybeHls | null>,
            setLevels: React.Dispatch<React.SetStateAction<number[]>>
        ) => {
            if (!el || !url) return
            if (holder.current) {
                try {
                    holder.current.destroy()
                } catch {}
                holder.current = null
            }
            setErrorText(null)

            if (!isHls(url)) {
                el.src = url
                setLevels([])
                return
            }
            if (nativeHls(el)) {
                el.src = url
                setLevels([])
                return
            }

            const Hls = await loadHls()
            if (!Hls || !Hls.isSupported()) {
                el.src = url
                setLevels([])
                return
            }

            const hls = new Hls({
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
                xhrSetup: (xhr: XMLHttpRequest) => {
                    xhr.withCredentials = false
                },
            })
            holder.current = hls

            const refresh = () => {
                const hs = (hls.levels || [])
                    .map((L: any) => L?.height || 0)
                    .filter(Boolean)
                    .sort((a: number, b: number) => b - a)
                setLevels(hs)
            }

            hls.on(Hls.Events.MANIFEST_PARSED, refresh)
            hls.on(Hls.Events.LEVELS_UPDATED, refresh)
            hls.on(Hls.Events.LEVEL_SWITCHED, refresh)
            hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
                if (data?.fatal) {
                    if (
                        data.type === "networkError" ||
                        data.details === "manifestLoadError"
                    ) {
                        try {
                            hls.startLoad()
                        } catch {}
                    } else if (data.type === "mediaError") {
                        try {
                            hls.recoverMediaError()
                        } catch {}
                    } else {
                        setErrorText(
                            "HLS fatal error. Check CORS and source availability."
                        )
                        try {
                            hls.destroy()
                        } catch {}
                        holder.current = null
                    }
                }
            })

            hls.attachMedia(el)
            hls.loadSource(url)
        },
        [hlsCapToSize, hlsLowLatency, hlsPreferLowStart]
    )

    React.useEffect(() => {
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b || !srcMentor || !srcDisplay) return
        attach(a, srcMentor, mentorHlsRef, setMentorLevels)
        attach(b, srcDisplay, displayHlsRef, setDisplayLevels)
        return () => {
            try {
                mentorHlsRef.current?.destroy()
            } catch {}
            try {
                displayHlsRef.current?.destroy()
            } catch {}
            mentorHlsRef.current = null
            displayHlsRef.current = null
        }
    }, [attach, srcMentor, srcDisplay])

    /* ----- Start playback once ready (no restart on mute/loop) ----- */
    React.useEffect(() => {
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b || !srcMentor || !srcDisplay) return

        const ready = (v: HTMLVideoElement) =>
            new Promise<void>((resolve) => {
                if (v.readyState >= 2) return resolve()
                const on = () => {
                    v.removeEventListener("canplay", on)
                    resolve()
                }
                v.addEventListener("canplay", on)
            })

        ;(async () => {
            await Promise.all([ready(a), ready(b)])
            a.currentTime = 0
            b.currentTime = 0
            setDuration(Math.max(a.duration || 0, b.duration || 0))
            if (autoplay) await Promise.allSettled([a.play(), b.play()])
        })()
    }, [srcMentor, srcDisplay, autoplay])

    // Apply mute/loop/volume without re-initializing sources
    React.useEffect(() => {
        if (mentorRef.current) mentorRef.current.muted = mentorMuted
    }, [mentorMuted])
    React.useEffect(() => {
        if (mentorRef.current) mentorRef.current.loop = loop
        if (displayRef.current) displayRef.current.loop = loop
    }, [loop])
    React.useEffect(() => {
        if (mentorRef.current) mentorRef.current.volume = mentorVolume
    }, [mentorVolume])

    /* ----- Time + PiP + micro resync via rVFC when available ----- */
    React.useEffect(() => {
        let stop = false
        const main = () =>
            isMentorMain ? mentorRef.current : displayRef.current
        const other = () =>
            isMentorMain ? displayRef.current : mentorRef.current

        const draw = () => {
            const m = main()
            const o = other()
            if (!m) return
            setCurrent(m.currentTime || 0)
            // micro re-sync if drift > 120ms
            if (
                o &&
                Math.abs((o.currentTime || 0) - (m.currentTime || 0)) > 0.12
            ) {
                try {
                    o.currentTime = m.currentTime || 0
                } catch {}
            }
            // buffered percent
            if (showBuffered) {
                try {
                    const buf = m.buffered
                    let end = 0
                    for (let i = 0; i < buf.length; i++)
                        end = Math.max(end, buf.end(i))
                    const pct = duration
                        ? (Math.min(end, duration) / duration) * 100
                        : 0
                    setBufferedPct(pct)
                } catch {}
            }
            // PiP canvas draw
            if (pip && pipCanvasRef.current && o && o.readyState >= 2) {
                const canvas = pipCanvasRef.current!
                const ctx = canvas.getContext("2d", {
                    willReadFrequently: true,
                }) as CanvasRenderingContext2D | null
                if (ctx) {
                    const vw = o.videoWidth || 16,
                        vh = o.videoHeight || 9
                    const cw = canvas.width,
                        ch = canvas.height
                    const vR = vw / vh,
                        cR = cw / ch
                    let dw = cw,
                        dh = ch,
                        dx = 0,
                        dy = 0
                    if (objectFit === "cover") {
                        if (vR > cR) {
                            dh = ch
                            dw = ch * vR
                            dx = (cw - dw) / 2
                        } else {
                            dw = cw
                            dh = cw / vR
                            dy = (ch - dh) / 2
                        }
                    } else {
                        if (vR > cR) {
                            dw = cw
                            dh = cw / vR
                            dy = (ch - dh) / 2
                        } else {
                            dh = ch
                            dw = ch * vR
                            dx = (cw - dw) / 2
                        }
                    }
                    ctx.clearRect(0, 0, cw, ch)
                    try {
                        /* @ts-ignore */ ctx.drawImage(o, dx, dy, dw, dh)
                    } catch {}
                }
            }
        }

        const m = main()
        // Prefer requestVideoFrameCallback for precise updates
        let rafId: number | null = null
        let rvfcId: number | null = null
        const loop = () => {
            if (stop) return
            draw()
            rafId = requestAnimationFrame(loop)
        }
        if ((m as any)?.requestVideoFrameCallback) {
            const step = () => {
                if (stop) return
                draw()
                rvfcId = (m as any).requestVideoFrameCallback(step)
            }
            rvfcId = (m as any).requestVideoFrameCallback(step)
        } else {
            rafId = requestAnimationFrame(loop)
        }

        const onWaiting = () => setIsBuffering(true)
        const onPlaying = () => setIsBuffering(false)
        m?.addEventListener("waiting", onWaiting)
        m?.addEventListener("playing", onPlaying)
        m?.addEventListener("canplay", onPlaying)

        return () => {
            stop = true
            if (rafId) cancelAnimationFrame(rafId)
            if (rvfcId && (m as any)?.cancelVideoFrameCallback) {
                try {
                    ;(m as any).cancelVideoFrameCallback(rvfcId)
                } catch {}
            }
            m?.removeEventListener("waiting", onWaiting)
            m?.removeEventListener("playing", onPlaying)
            m?.removeEventListener("canplay", onPlaying)
        }
    }, [isMentorMain, pip, objectFit, showBuffered, duration])

    /* ----- Auto-pause when offscreen ----- */
    React.useEffect(() => {
        if (!autoPauseOffscreen) return
        const root = containerRef.current
        if (!root) return
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b) return
        let wasPlaying = false
        const io = new IntersectionObserver(
            (entries) => {
                const v = entries[0]
                if (!v) return
                const visible = v.isIntersecting && v.intersectionRatio > 0.1
                if (!visible) {
                    wasPlaying = !(a.paused && b.paused)
                    a.pause()
                    b.pause()
                } else if (visible && wasPlaying) {
                    a.play().catch(() => {})
                    b.play().catch(() => {})
                }
            },
            { threshold: [0, 0.1, 0.5, 1] }
        )
        io.observe(root)
        return () => io.disconnect()
    }, [autoPauseOffscreen])

    /* ----- Media Session (hardware keys / OS controls) ----- */
    React.useEffect(() => {
        if (!("mediaSession" in navigator)) return
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b) return
        navigator.mediaSession!.setActionHandler?.("play", () => {
            a.play().catch(() => {})
            b.play().catch(() => {})
        })
        navigator.mediaSession!.setActionHandler?.("pause", () => {
            a.pause()
            b.pause()
        })
        navigator.mediaSession!.setActionHandler?.("seekbackward", (d: any) =>
            seekBy(-(d?.seekOffset || skipBig))
        )
        navigator.mediaSession!.setActionHandler?.("seekforward", (d: any) =>
            seekBy(+(d?.seekOffset || skipBig))
        )
    }, [skipBig])

    /* ----- Actions ----- */
    const playPause = () => {
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b) return
        a.paused
            ? (a.play().catch(() => {}), b.play().catch(() => {}))
            : (a.pause(), b.pause())
    }
    const toggleMuteMentor = () => setMentorMuted((v) => !v)
    const setSpeed = (r: number) => {
        const idx = Math.max(0, SPEEDS.indexOf(r as any))
        const rate = idx >= 0 ? SPEEDS[idx] : 1
        if (mentorRef.current) mentorRef.current.playbackRate = rate
        if (displayRef.current) displayRef.current.playbackRate = rate
        setRateIndex(Math.max(0, idx))
    }
    const cycleSpeed = () => setSpeed(SPEEDS[(rateIndex + 1) % SPEEDS.length])
    const incSpeed = () =>
        setSpeed(SPEEDS[clamp(rateIndex + 1, 0, SPEEDS.length - 1)])
    const decSpeed = () =>
        setSpeed(SPEEDS[clamp(rateIndex - 1, 0, SPEEDS.length - 1)])

    const seekTo = (t: number) => {
        const a = mentorRef.current,
            b = displayRef.current
        if (!a || !b) return
        const tt = clamp(t, 0, duration || 0)
        a.currentTime = tt
        b.currentTime = tt
        setCurrent(tt)
        if (enableDeepLinks && updateUrlOnSeek) {
            const url = new URL(window.location.href)
            url.searchParams.set("t", Math.floor(tt).toString())
            history.replaceState({}, "", url.toString())
        }
    }
    const seekBy = (delta: number) =>
        seekTo(
            (isMentorMain
                ? mentorRef.current?.currentTime || 0
                : displayRef.current?.currentTime || 0) + delta
        )
    const swapView = () => {
        setView((v) => (v === "mentor" ? "display" : "mentor"))
        bumpUI()
    }

    const setQualityForBoth = (height: number | -1) => {
        setQuality(height)
        const apply = (hls: MaybeHls | null) => {
            if (!hls || !hls.levels) return
            if (height === -1) {
                hls.currentLevel = -1
                return
            }
            let idx = -1,
                best = Number.MAX_SAFE_INTEGER
            hls.levels.forEach((L: any, i: number) => {
                if (!L?.height) return
                const d = Math.abs(L.height - height)
                if (d < best) {
                    best = d
                    idx = i
                }
            })
            if (idx >= 0) hls.currentLevel = idx
        }
        apply(mentorHlsRef.current)
        apply(displayHlsRef.current)
    }

    /* ----- Deep links ----- */
    React.useEffect(() => {
        if (!enableDeepLinks) return
        const parseFromUrl = () => {
            const u = new URL(window.location.href)
            const q = u.searchParams.get("t")
            const h = u.hash.match(/t=([^&]+)/)?.[1]
            const raw = q ?? h ?? null
            if (!raw) return null
            return parseTime(raw)
        }
        const t = parseFromUrl()
        if (t !== null) seekTo(t)
        const onHash = () => {
            const tt = parseFromUrl()
            if (tt !== null) seekTo(tt)
        }
        window.addEventListener("hashchange", onHash)
        return () => window.removeEventListener("hashchange", onHash)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableDeepLinks, duration])

    /* ----- Keyboard + FS + Help + Native PiP ----- */
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Avoid typing inside inputs
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
            if (
                tag === "input" ||
                tag === "textarea" ||
                (e.target as HTMLElement)?.isContentEditable
            )
                return
            switch (e.key) {
                case " ":
                    e.preventDefault()
                    playPause()
                    break
                case "m":
                case "M":
                    toggleMuteMentor()
                    break
                case "t":
                case "T":
                    swapView()
                    break
                case "f":
                case "F":
                    document.fullscreenElement
                        ? document.exitFullscreen()
                        : containerRef.current?.requestFullscreen()
                    break
                case "ArrowRight":
                    seekBy(e.shiftKey ? +skipSmall : +skipBig)
                    break
                case "ArrowLeft":
                    seekBy(e.shiftKey ? -skipSmall : -skipBig)
                    break
                case ",":
                    decSpeed()
                    break // YouTube-style slower
                case ".":
                    incSpeed()
                    break // faster
                case "j":
                case "J":
                    seekBy(-10)
                    break
                case "l":
                case "L":
                    seekBy(+10)
                    break
                case "k":
                case "K":
                    playPause()
                    break
                case "c":
                case "C":
                    setPipCollapsed((v) => !v)
                    break
                case "?":
                    if (keyboardHelpOverlay) setShowHelp((v) => !v)
                    break
                case "p":
                case "P":
                    if (enableNativePiP) toggleNativePiP()
                    break
                default:
                    break
            }
        }
        window.addEventListener("keydown", onKey)
        const onFS = () => setIsFS(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", onFS)
        return () => {
            window.removeEventListener("keydown", onKey)
            document.removeEventListener("fullscreenchange", onFS)
        }
    }, [isMentorMain, skipSmall, skipBig, keyboardHelpOverlay, enableNativePiP])

    /* ----- Native Picture-in-Picture ----- */
    const toggleNativePiP = async () => {
        try {
            if (!(document as any).pictureInPictureEnabled) return
            const target = isMentorMain ? displayRef.current : mentorRef.current // pop out the secondary view
            nativePipTargetRef.current = target || null
            // @ts-ignore
            if (document.pictureInPictureElement) {
                // @ts-ignore
                await document.exitPictureInPicture()
            } else if (target) {
                // Some browsers require controls to be visible
                ;(target as any).disablePictureInPicture = false
                // @ts-ignore
                await (target as any).requestPictureInPicture?.()
            }
        } catch {}
    }

    /* ----- PiP drag/resize with snap ----- */
    const drag = React.useRef<{
        startX: number
        startY: number
        baseX: number
        baseY: number
        dragging: boolean
    }>({ startX: 0, startY: 0, baseX: 0, baseY: 0, dragging: false })
    const onPipDown = (e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        drag.current.dragging = true
        drag.current.startX = e.clientX
        drag.current.startY = e.clientY
        drag.current.baseX = pipPos.x
        drag.current.baseY = pipPos.y
        ;(e.target as Element).setPointerCapture(e.pointerId)
    }
    const onPipMove = (e: React.PointerEvent) => {
        if (!drag.current.dragging) return
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const dx = ((e.clientX - drag.current.startX) / rect.width) * 100
        const dy = ((e.clientY - drag.current.startY) / rect.height) * 100
        const maxW = 98 - pipSize
        const maxH = 98 - (pipSize * 9) / 16
        let x = clamp(drag.current.baseX + dx, 2, maxW)
        let y = clamp(drag.current.baseY + dy, 2, maxH)
        if (pipSnap) {
            const snap = 3 // percent
            const corners = [2, maxW]
            corners.forEach((cx) => {
                if (Math.abs(x - cx) < snap) x = cx
            })
            const ys = [2, maxH]
            ys.forEach((cy) => {
                if (Math.abs(y - cy) < snap) y = cy
            })
        }
        setPipPos({ x, y })
    }
    const onPipUp = () => {
        drag.current.dragging = false
        if (pipRememberPosition) {
            try {
                localStorage.setItem(storedKey, JSON.stringify(pipPos))
                localStorage.setItem(storedSizeKey, JSON.stringify(pipSize))
            } catch {}
        }
    }
    const onPipWheel = (e: React.WheelEvent) => {
        if (!pipWheelResize) return
        e.preventDefault()
        e.stopPropagation()
        const dir = e.deltaY > 0 ? -1 : 1
        setPipSize((s) => clamp(Math.round(s + dir * 2), pipMinPct, pipMaxPct))
    }

    /* ----- Styles ----- */
    const container: React.CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "black",
        aspectRatio: aspect.replace(":", " / "),
        overflow: "hidden",
        borderRadius: 12,
        userSelect: "none",
    }
    const videoLayer: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        ...(debug ? { outline: "2px solid #00D1FF" } : {}),
    }
    const vid: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit,
        transition: "opacity 160ms ease",
        backgroundColor: "black",
    }
    const backdrop: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "auto",
        ...(debug ? { outline: "2px dashed #FF9F0A" } : {}),
    }

    const controlsZ = 10
    const barGrad =
        "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.7) 100%)"
    const controlsWrap: React.CSSProperties = {
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
    }

    const stopBubble = (e: React.SyntheticEvent) => e.stopPropagation()
    const kill = (e: React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const ne = (e as any).nativeEvent
        if (ne?.stopImmediatePropagation) ne.stopImmediatePropagation()
    }
    const Btn: React.FC<{
        onFire: () => void
        title: string
        children: React.ReactNode
    }> = ({ onFire, title, children }) => (
        <button
            title={title}
            onPointerDownCapture={kill}
            onPointerUpCapture={(e) => {
                kill(e)
                onFire()
            }}
            onClick={kill}
            style={{
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
            }}
            aria-label={title}
        >
            {children}
        </button>
    )

    const pipWidth = `${clamp(pipSize, pipMinPct, pipMaxPct)}%`
    const pipStyle: React.CSSProperties = {
        position: "absolute",
        left: `${pipPos.x}%`,
        top: `${pipPos.y}%`,
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
    }

    /* ===== Render ===== */
    return (
        <div
            ref={containerRef}
            style={container}
            onMouseMove={bumpUI}
            onMouseLeave={() => !alwaysShowControls && setShowUI(false)}
        >
            {/* Videos */}
            <div style={videoLayer}>
                <video
                    ref={mentorRef}
                    crossOrigin="anonymous"
                    muted={mentorMuted}
                    playsInline
                    preload="auto"
                    style={{ ...vid, opacity: isMentorMain ? 1 : 0 }}
                />
                <video
                    ref={displayRef}
                    crossOrigin="anonymous"
                    muted
                    playsInline
                    preload="auto"
                    style={{ ...vid, opacity: isMentorMain ? 0 : 1 }}
                />
            </div>

            {/* Click anywhere to play/pause */}
            <div style={backdrop} onPointerUp={playPause} />

            {/* PiP (drag + resize + collapse) */}
            {pip && (
                <div
                    onPointerDown={onPipDown}
                    onPointerMove={onPipMove}
                    onPointerUp={onPipUp}
                    onWheel={onPipWheel}
                    style={pipStyle}
                    title="Drag to move • Scroll to resize • Click to swap • Double-click to collapse"
                    onDoubleClick={() => setPipCollapsed((v) => !v)}
                    onClick={(e) => {
                        e.stopPropagation()
                        swapView()
                    }}
                >
                    {!pipCollapsed ? (
                        <>
                            <canvas
                                ref={pipCanvasRef}
                                width={640}
                                height={360}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "block",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    left: 6,
                                    top: 6,
                                    padding: "3px 8px",
                                    borderRadius: 999,
                                    fontSize: 11,
                                    color: "white",
                                    background: accent,
                                }}
                            >
                                {isMentorMain ? "Display View" : "Mentor View"}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    right: 6,
                                    top: 6,
                                    display: "flex",
                                    gap: 6,
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setPipCollapsed(true)
                                    }}
                                    style={{
                                        padding: "4px 6px",
                                        borderRadius: 8,
                                        background: "rgba(0,0,0,.55)",
                                        color: "#fff",
                                        border: "1px solid rgba(255,255,255,.18)",
                                        cursor: "pointer",
                                    }}
                                >
                                    −
                                </button>
                            </div>
                        </>
                    ) : (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 12,
                                background: "rgba(0,0,0,.35)",
                            }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPipCollapsed(false)
                                }}
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: 8,
                                    background: "rgba(0,0,0,.6)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,.2)",
                                    cursor: "pointer",
                                }}
                            >
                                Expand
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Controls */}
            <div
                style={controlsWrap}
                onPointerDownCapture={stopBubble}
                onClick={stopBubble}
                onWheel={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const delta = e.shiftKey ? skipSmall : skipBig
                    const dir = e.deltaY > 0 ? 1 : -1
                    const base = isMentorMain
                        ? mentorRef.current?.currentTime || 0
                        : displayRef.current?.currentTime || 0
                    seekTo(base + dir * delta)
                }}
                onMouseEnter={() => {
                    setHoldUI(true)
                }}
                onMouseLeave={() => {
                    setHoldUI(false)
                    bumpUI()
                }}
            >
                {/* Timeline with buffered and chapter flags */}
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span
                        style={{
                            color: "#fff",
                            fontSize: 12,
                            minWidth: 46,
                            textAlign: "right",
                        }}
                    >
                        {fmt(current)}
                    </span>

                    <div style={{ position: "relative", flex: 1 }}>
                        {/* Buffered track */}
                        {showBuffered && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    height: compactUI ? 6 : 8,
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.2)",
                                }}
                            />
                        )}
                        {showBuffered && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    height: compactUI ? 6 : 8,
                                    width: `${bufferedPct}%`,
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.45)",
                                    transition: "width .2s linear",
                                }}
                            />
                        )}
                        {/* Progress/seek thumb */}
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.05}
                            value={Math.min(current, duration || 0)}
                            onInput={(e) =>
                                seekTo(
                                    parseFloat(
                                        (e.target as HTMLInputElement).value
                                    )
                                )
                            }
                            onChange={(e) =>
                                seekTo(
                                    parseFloat(
                                        (e.target as HTMLInputElement).value
                                    )
                                )
                            }
                            style={{
                                position: "relative",
                                zIndex: 2,
                                width: "100%",
                                appearance: "none",
                                height: compactUI ? 6 : 8,
                                borderRadius: 999,
                                background: `linear-gradient(90deg, ${accent} ${duration ? (current / duration) * 100 : 0}%, rgba(255,255,255,0) 0)`,
                                outline: "none",
                                touchAction: "none",
                                cursor: "pointer",
                            }}
                            aria-label="Seek"
                        />

                        {/* small flags positioned just above the bar, clickable */}
                        {chapters.length > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    bottom: compactUI ? 8 : 10,
                                    height: 10,
                                    zIndex: 3,
                                }}
                            >
                                {chapters.map((c, i) => {
                                    const leftPct = duration
                                        ? (c.t / duration) * 100
                                        : 0
                                    return (
                                        <div
                                            key={i}
                                            title={`${c.label} • ${fmt(c.t)}`}
                                            onMouseEnter={() =>
                                                setTooltip({
                                                    leftPct,
                                                    text: `${c.label} • ${fmt(c.t)}`,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setTooltip(null)
                                            }
                                            onClick={() => seekTo(c.t)}
                                            style={{
                                                position: "absolute",
                                                left: `calc(${leftPct}% - 1px)`,
                                                bottom: 0,
                                                width: 2,
                                                height: 8,
                                                borderRadius: 2,
                                                background:
                                                    "rgba(255,255,255,.9)",
                                                cursor: "pointer",
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <span style={{ color: "#fff", fontSize: 12, minWidth: 46 }}>
                        {fmt(duration)}
                    </span>
                </div>

                {/* Buttons row */}
                <div
                    style={{
                        marginTop: compactUI ? 6 : 10,
                        display: "flex",
                        alignItems: "center",
                        gap: compactUI ? 8 : 10,
                    }}
                >
                    <Btn
                        onFire={() => seekBy(-skipBig)}
                        title={`Back ${skipBig}s`}
                    >
                        <Icon.Back10 />
                    </Btn>
                    <Btn onFire={playPause} title="Play/Pause (Space)">
                        {(
                            isMentorMain
                                ? mentorRef.current?.paused
                                : displayRef.current?.paused
                        ) ? (
                            <Icon.Play />
                        ) : (
                            <Icon.Pause />
                        )}
                    </Btn>
                    <Btn
                        onFire={() => seekBy(+skipBig)}
                        title={`Forward ${skipBig}s`}
                    >
                        <Icon.Fwd10 />
                    </Btn>

                    <Btn onFire={cycleSpeed} title="Speed">
                        <Icon.Speed />
                        <span>{SPEEDS[rateIndex]}×</span>
                    </Btn>
                    <Btn
                        onFire={toggleMuteMentor}
                        title="Mute/Unmute Mentor (M)"
                    >
                        {mentorMuted ? <Icon.Mute /> : <Icon.Volume />}
                    </Btn>
                    {showVolumeSlider && (
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.02}
                            value={mentorMuted ? 0 : mentorVolume}
                            onInput={(e) => {
                                const v = parseFloat(
                                    (e.target as HTMLInputElement).value
                                )
                                setMentorVolume(v)
                                if (v === 0 && !mentorMuted)
                                    setMentorMuted(true)
                                if (v > 0 && mentorMuted) setMentorMuted(false)
                            }}
                            aria-label="Volume"
                            style={{
                                width: 90,
                                height: 6,
                                appearance: "none",
                                background: "rgba(255,255,255,.25)",
                                borderRadius: 999,
                            }}
                        />
                    )}
                    <Btn onFire={swapView} title="Swap View (T)">
                        <Icon.Swap />
                    </Btn>

                    {/* Chapters popover */}
                    {chapters.length > 0 && (
                        <div style={{ position: "relative" }}>
                            <Btn
                                onFire={() => setChaptersOpen((o) => !o)}
                                title="Chapters"
                            >
                                <Icon.Chapter />
                            </Btn>
                            {chaptersOpen && (
                                <div
                                    onMouseEnter={() => setHoldUI(true)}
                                    onMouseLeave={() => {
                                        setHoldUI(false)
                                        setChaptersOpen(false)
                                        bumpUI()
                                    }}
                                    style={{
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
                                    }}
                                >
                                    {chapters.map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                seekTo(c.t)
                                                setChaptersOpen(false)
                                            }}
                                            style={{
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
                                            }}
                                        >
                                            <span style={{ opacity: 0.9 }}>
                                                {c.label}
                                            </span>
                                            <span style={{ opacity: 0.6 }}>
                                                {fmt(c.t)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quality popover */}
                    {anyHls && (
                        <div style={{ position: "relative" }}>
                            <Btn
                                onFire={() => setQOpen((o) => !o)}
                                title="Quality"
                            >
                                <Icon.Quality />
                                <span>
                                    {quality === -1 ? "Auto" : `${quality}p`}
                                </span>
                            </Btn>
                            {qOpen && (
                                <div
                                    onMouseEnter={() => setHoldUI(true)}
                                    onMouseLeave={() => {
                                        setHoldUI(false)
                                        setQOpen(false)
                                        bumpUI()
                                    }}
                                    style={{
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
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setQualityForBoth(-1)
                                            setQOpen(false)
                                        }}
                                        style={{
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
                                        }}
                                    >
                                        Auto
                                    </button>
                                    {qualities.map((h) => (
                                        <button
                                            key={h}
                                            onClick={() => {
                                                setQualityForBoth(h)
                                                setQOpen(false)
                                            }}
                                            style={{
                                                width: "100%",
                                                textAlign: "left",
                                                padding: "6px 8px",
                                                background: "transparent",
                                                color: "#fff",
                                                border: "none",
                                                cursor: "pointer",
                                                borderRadius: 8,
                                                fontSize: FONT,
                                            }}
                                        >
                                            {h}p
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Native PiP pop-out */}
                    {enableNativePiP && (
                        <Btn
                            onFire={toggleNativePiP}
                            title="Pop-out Secondary (PiP)"
                        >
                            <Icon.PopOut />
                        </Btn>
                    )}

                    {/* Share */}
                    <Btn
                        onFire={() => {
                            try {
                                const url = new URL(window.location.href)
                                url.searchParams.set(
                                    "t",
                                    Math.floor(current).toString()
                                )
                                navigator.clipboard?.writeText(url.toString())
                            } catch {}
                        }}
                        title="Copy link to current time"
                    >
                        <Icon.Link />
                    </Btn>

                    {/* Fullscreen */}
                    <div style={{ marginLeft: "auto" }}>
                        <Btn
                            onFire={() =>
                                document.fullscreenElement
                                    ? document.exitFullscreen()
                                    : containerRef.current?.requestFullscreen()
                            }
                            title={
                                isFS ? "Exit Fullscreen (F)" : "Fullscreen (F)"
                            }
                        >
                            {isFS ? <Icon.FSExit /> : <Icon.FS />}
                        </Btn>
                    </div>
                </div>
            </div>

            {/* Chapter tooltip just above the bar */}
            {tooltip && (
                <div
                    style={{
                        position: "absolute",
                        left: `${tooltip.leftPct}%`,
                        bottom: compactUI ? 44 : 56,
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                        zIndex: 60,
                    }}
                >
                    <div
                        style={{
                            background: "rgba(0,0,0,.85)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,.2)",
                            borderRadius: 8,
                            padding: "3px 8px",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tooltip.text}
                    </div>
                </div>
            )}

            {/* Buffering / Error overlays */}
            {isBuffering && !errorText && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                        zIndex: 12,
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            border: "4px solid rgba(255,255,255,0.25)",
                            borderTopColor: accent,
                            animation: "spin .9s linear infinite",
                        }}
                    />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            )}
            {errorText && (
                <div
                    style={{
                        position: "absolute",
                        inset: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 20,
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            maxWidth: 640,
                            width: "100%",
                            background: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            border: "1px solid rgba(255,255,255,0.2)",
                            whiteSpace: "pre-wrap",
                            fontSize: 12,
                        }}
                    >
                        {errorText}
                    </div>
                </div>
            )}

            {/* Keyboard help overlay */}
            {keyboardHelpOverlay && showHelp && (
                <div
                    onClick={() => setShowHelp(false)}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        zIndex: 100,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(0,0,0,0.75)",
                            border: "1px solid rgba(255,255,255,.2)",
                            padding: 16,
                            borderRadius: 12,
                            maxWidth: 640,
                            width: "90%",
                            fontSize: 13,
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Keyboard Shortcuts
                        </div>
                        <ul
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            <li>
                                <b>Space / K</b> — Play/Pause
                            </li>
                            <li>
                                <b>M</b> — Mute/Unmute
                            </li>
                            <li>
                                <b>J / L</b> — −/+10s
                            </li>
                            <li>
                                <b>← / →</b> — −/+{skipBig}s ({skipSmall}s with
                                Shift)
                            </li>
                            <li>
                                <b>, / .</b> — Slower/Faster
                            </li>
                            <li>
                                <b>T</b> — Swap Views
                            </li>
                            <li>
                                <b>C</b> — Collapse/Expand PiP
                            </li>
                            <li>
                                <b>F</b> — Fullscreen
                            </li>
                            {enableNativePiP && (
                                <li>
                                    <b>P</b> — Pop-out Secondary (native PiP)
                                </li>
                            )}
                            <li>
                                <b>?</b> — Toggle this help
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

DualViewPlayer_v4_0.displayName = "Dual View Player v4.0"

/* ===== Framer Controls ===== */
addPropertyControls(DualViewPlayer_v4_0, {
    mentorHtml: {
        title: "Mentor Video HTML",
        type: ControlType.String,
        placeholder: "Paste <video>…</video> or https://…/mentor.m3u8",
    },
    displayHtml: {
        title: "Display Video HTML",
        type: ControlType.String,
        placeholder: "Paste <video>…</video> or https://…/display.m3u8",
    },

    instanceId: {
        title: "Instance ID",
        type: ControlType.String,
        defaultValue: "dualview",
    },

    startView: {
        title: "Start View",
        type: ControlType.SegmentedEnum,
        options: ["mentor", "display"],
        optionTitles: ["Mentor", "Display"],
        defaultValue: "mentor",
    },
    autoplay: {
        title: "Autoplay",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    muted: {
        title: "Mute Mentor",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    loop: { title: "Loop", type: ControlType.Boolean, defaultValue: false },

    objectFit: {
        title: "Object Fit",
        type: ControlType.SegmentedEnum,
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        defaultValue: "cover",
    },
    aspect: {
        title: "Aspect",
        type: ControlType.Enum,
        options: ["16:9", "4:3", "1:1"],
        optionTitles: ["16:9", "4:3", "1:1"],
        defaultValue: "16:9",
    },
    accent: {
        title: "Accent",
        type: ControlType.Color,
        defaultValue: "#7C3AED",
    },

    compactUI: {
        title: "Compact UI",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    autoHideMs: {
        title: "Autohide (ms)",
        type: ControlType.Number,
        min: 800,
        max: 8000,
        step: 100,
        defaultValue: 3200,
    },
    alwaysShowControls: {
        title: "Always Show Controls",
        type: ControlType.Boolean,
        defaultValue: false,
    },

    pip: {
        title: "Mini Preview",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    pipSizePct: {
        title: "Mini Size % (initial)",
        type: ControlType.Number,
        min: 12,
        max: 44,
        step: 1,
        defaultValue: 24,
    },
    pipMinPct: {
        title: "Mini Min %",
        type: ControlType.Number,
        min: 8,
        max: 30,
        step: 1,
        defaultValue: 12,
    },
    pipMaxPct: {
        title: "Mini Max %",
        type: ControlType.Number,
        min: 30,
        max: 60,
        step: 1,
        defaultValue: 44,
    },
    pipStartCorner: {
        title: "PiP Corner",
        type: ControlType.SegmentedEnum,
        options: ["br", "bl", "tr", "tl"],
        optionTitles: ["BR", "BL", "TR", "TL"],
        defaultValue: "br",
    },
    pipRememberPosition: {
        title: "Remember Position",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    pipSnap: {
        title: "Snap to Corners",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    pipWheelResize: {
        title: "Wheel Resize PiP",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    timestamps: {
        title: "Timestamps",
        type: ControlType.Array,
        propertyControl: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                time: {
                    type: ControlType.String,
                    title: "Time (1:23 / 83 / 1m23s)",
                },
            },
        },
    },

    enableDeepLinks: {
        title: "Enable Deep Links",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    updateUrlOnSeek: {
        title: "Update URL on Seek",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    skipSmall: {
        title: "Skip Small (s)",
        type: ControlType.Number,
        min: 0.1,
        max: 2,
        step: 0.05,
        defaultValue: 0.25,
    },
    skipBig: {
        title: "Skip Big (s)",
        type: ControlType.Number,
        min: 3,
        max: 15,
        step: 1,
        defaultValue: 5,
    },
    showBuffered: {
        title: "Show Buffered",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    showVolumeSlider: {
        title: "Show Volume Slider",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    keyboardHelpOverlay: {
        title: "Keyboard Help Overlay",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    autoPauseOffscreen: {
        title: "Auto Pause Offscreen",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    hlsLowLatency: {
        title: "HLS Low Latency",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    hlsPreferLowStart: {
        title: "Prefer Low Start",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    hlsCapToSize: {
        title: "Cap Level to Player Size",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    enableNativePiP: {
        title: "Enable Native PiP",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    debug: {
        title: "Debug Outlines",
        type: ControlType.Boolean,
        defaultValue: false,
    },
})
