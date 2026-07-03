'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
    Mic, MicOff, Volume2, VolumeX, Square, Play,
    ChevronDown, Sparkles, AlertCircle, BookOpen, X, Loader2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import type { ConversationMode, GrammarCorrection, VocabSuggestion } from '@/lib/types'

const MODE_CONFIG: Record<ConversationMode, { label: string; emoji: string; systemHint: string; color: string }> = {
    normal_chat: { label: 'Free Chat', emoji: '💬', systemHint: 'Have a friendly, open-ended conversation', color: 'from-violet to-violet-light' },
    interview: { label: 'Interview', emoji: '💼', systemHint: 'Conduct a professional job interview', color: 'from-blue-500 to-violet' },
    ielts: { label: 'IELTS', emoji: '🎓', systemHint: 'Practice IELTS speaking test (Parts 1–3)', color: 'from-emerald-500 to-teal-600' },
    roleplay: { label: 'Role Play', emoji: '🎭', systemHint: 'Engage in a real-world roleplay scenario', color: 'from-gold to-orange-500' },
    storytelling: { label: 'Storytelling', emoji: '📖', systemHint: 'Tell and develop creative stories', color: 'from-pink-500 to-rose-600' },
    debate: { label: 'Debate', emoji: '⚡', systemHint: 'Engage in a structured debate', color: 'from-cyan-500 to-blue-500' },
    presentation: { label: 'Presentation', emoji: '🎯', systemHint: 'Practice public speaking and presentations', color: 'from-violet to-purple-600' },
}

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }
interface FeedbackState { corrections: GrammarCorrection[]; vocabulary: VocabSuggestion[]; score: Record<string, number> | null }

// Waveform animation bars
function WaveformBars({ active }: { active: boolean }) {
    return (
        <div className="flex items-center gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i}
                    className="w-0.5 rounded-full bg-violet-glow"
                    animate={active ? { scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3] } : { scaleY: 0.15 }}
                    transition={{ duration: 0.6 + i * 0.02, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }}
                    style={{ height: 32 }}
                />
            ))}
        </div>
    )
}

// Score pill
function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="text-center px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.07]">
            <div className={`font-heading font-bold text-xl ${color}`}>{value.toFixed(1)}</div>
            <div className="text-white/40 text-xs mt-0.5">{label}</div>
        </div>
    )
}

function ConversationInner() {
    const searchParams = useSearchParams()
    const rawMode = searchParams.get('mode') as ConversationMode | null
    const mode: ConversationMode = rawMode && MODE_CONFIG[rawMode] ? rawMode : 'normal_chat'
    const modeConfig = MODE_CONFIG[mode]

    const [isRecording, setIsRecording] = useState(false)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hello! I'm your AI English coach. ${modeConfig.systemHint}. Let's begin — what would you like to talk about?`, timestamp: new Date() }
    ])
    const [liveTranscript, setLiveTranscript] = useState('')
    const [feedback, setFeedback] = useState<FeedbackState>({ corrections: [], vocabulary: [], score: null })
    const [showFeedback, setShowFeedback] = useState(false)
    const [selectMode, setSelectMode] = useState(false)
    const [duration, setDuration] = useState(0)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<BlobPart[]>([])
    const isMutedRef = useRef(isMuted)

    useEffect(() => {
        isMutedRef.current = isMuted
    }, [isMuted])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        // Initialize WebSocket connection
        const convId = Math.random().toString(36).substring(7)
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
        const ws = new WebSocket(`${wsUrl}/api/v1/conversation/${convId}`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === 'status') {
                if (data.status === 'transcribing') setIsProcessing(true)
                if (data.status === 'generating_reply') setLiveTranscript('')
                if (data.status === 'speaking') {
                    setIsProcessing(false)
                    setIsAISpeaking(true)
                }
                if (data.status === 'listening') {
                    setIsAISpeaking(false)
                    setIsProcessing(false)
                }
            } else if (data.type === 'transcript') {
                setLiveTranscript(data.text)
                setMessages(prev => [...prev, { role: 'user', content: data.text, timestamp: new Date() }])
                setTimeout(() => setLiveTranscript(''), 1500)
            } else if (data.type === 'ai_reply') {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text, timestamp: new Date() }])

                // Play audio if available and not muted
                if (data.audio && !isMutedRef.current) {
                    setIsAISpeaking(true)
                    const audio = new Audio(`data:audio/mp3;base64,${data.audio}`)
                    audio.play().catch(e => console.error("Audio playback error:", e))
                    audio.onended = () => setIsAISpeaking(false)
                }
                setIsProcessing(false)
            } else if (data.type === 'grammar') {
                setFeedback(prev => ({
                    ...prev,
                    corrections: data.corrections || [],
                    // Use real scores from backend algorithmic scoring service
                    score: data.score
                }))
                if ((data.corrections && data.corrections.length > 0) || data.score) {
                    setShowFeedback(true)
                }
            } else if (data.type === 'error') {
                setIsProcessing(false)
                setLiveTranscript('')
                console.error("Backend error:", data.message)
            }
        }

        wsRef.current = ws
        return () => ws.close()
    }, [])

    // When mode changes, inform the backend safely without disconnecting
    useEffect(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "set_mode", mode: mode }))
        }
    }, [mode])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onloadend = () => {
                    const base64data = reader.result?.toString().split(',')[1]
                    if (wsRef.current?.readyState === WebSocket.OPEN && base64data) {
                        wsRef.current.send(JSON.stringify({ audio: base64data }))
                        setIsProcessing(true)
                    }
                    stream.getTracks().forEach(track => track.stop())
                }
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setIsRecording(true)
            setLiveTranscript('Listening…')
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
        } catch (err) {
            console.error('Microphone access denied:', err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
        setLiveTranscript('Processing audio...')
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    return (
        <div className="h-screen flex flex-col bg-navy-950">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn-ghost p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="relative">
                        <button onClick={() => setSelectMode(!selectMode)}
                            className="flex items-center gap-2.5 glass rounded-xl px-4 py-2 hover:bg-white/[0.08] transition-colors">
                            <span className="text-lg">{modeConfig.emoji}</span>
                            <span className="font-semibold text-white text-sm">{modeConfig.label}</span>
                            <ChevronDown className="w-4 h-4 text-white/40" />
                        </button>
                        <AnimatePresence>
                            {selectMode && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                    className="absolute top-full mt-2 left-0 z-50 glass rounded-xl p-2 w-56 shadow-glass">
                                    {(Object.keys(MODE_CONFIG) as ConversationMode[]).map((m) => (
                                        <Link key={m} href={`/conversation?mode=${m}`} onClick={() => setSelectMode(false)}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${m === mode ? 'bg-violet/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
                                            <span>{MODE_CONFIG[m].emoji}</span>
                                            {MODE_CONFIG[m].label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="text-white/30 text-sm">{formatTime(duration)}</div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="btn-ghost p-2">
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button className="btn-secondary text-sm py-2">End Session</button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 gap-0">
                {/* Chat area */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {messages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${msg.role === 'assistant' ? 'bg-violet/30' : 'bg-gold/20'}`}>
                                    {msg.role === 'assistant' ? '🤖' : '👤'}
                                </div>
                                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
                                    ? 'bg-white/[0.06] rounded-tl-sm text-white/85'
                                    : 'bg-violet/20 border border-violet/20 rounded-tr-sm text-white/90'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}

                        {/* Live transcript */}
                        {(isRecording || liveTranscript) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 flex-row-reverse">
                                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-base flex-shrink-0">👤</div>
                                <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-violet/10 border border-violet/20 border-dashed text-sm text-white/60 italic">
                                    {liveTranscript || 'Listening…'}
                                    {isRecording && <span className="inline-block w-1 h-4 bg-violet-glow ml-1 animate-pulse rounded-full align-middle" />}
                                </div>
                            </motion.div>
                        )}

                        {/* Processing */}
                        {isProcessing && (
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-violet/30 flex items-center justify-center flex-shrink-0">🤖</div>
                                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-violet-glow animate-spin" />
                                    <span className="text-white/40 text-sm">Thinking…</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mic control */}
                    <div className="border-t border-white/[0.06] px-6 py-5 flex-shrink-0">
                        <div className="flex flex-col items-center gap-4">
                            {isRecording && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    <WaveformBars active={isRecording} />
                                </motion.div>
                            )}
                            <div className="flex items-center gap-6">
                                <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => isRecording ? stopRecording() : startRecording()}
                                    disabled={isAISpeaking || isProcessing}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording
                                        ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse'
                                        : 'bg-gradient-to-br from-violet to-violet-light shadow-glow-violet hover:scale-105'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {isRecording ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7 text-white" />}
                                </motion.button>
                                <p className="text-white/30 text-xs">
                                    {isAISpeaking ? '🔊 AI is speaking…' : isProcessing ? '⚙️ Processing…' : isRecording ? '🔴 Click to stop & send' : 'Click to start speaking'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback panel */}
                <AnimatePresence>
                    {showFeedback && feedback.score && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="border-l border-white/[0.06] overflow-y-auto flex-shrink-0 bg-navy-900">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-violet-glow" />
                                        <h3 className="font-heading font-semibold text-white text-sm">AI Feedback</h3>
                                    </div>
                                    <button onClick={() => setShowFeedback(false)} className="text-white/30 hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Scores */}
                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    <ScorePill label="Fluency" value={feedback.score.fluency} color="text-violet-glow" />
                                    <ScorePill label="Grammar" value={feedback.score.grammar} color="text-blue-400" />
                                    <ScorePill label="Vocabulary" value={feedback.score.vocabulary} color="text-emerald-400" />
                                    <ScorePill label="Confidence" value={feedback.score.confidence} color="text-gold-light" />
                                </div>

                                {/* Grammar corrections */}
                                {feedback.corrections.length > 0 && (
                                    <div className="mb-5">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                            <span className="text-xs font-semibold text-white/70">Grammar</span>
                                        </div>
                                        <div className="space-y-2">
                                            {feedback.corrections.map((c, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-red-500/[0.07] border border-red-500/20">
                                                    <div className="text-xs mb-1">
                                                        <span className="text-red-400 line-through">{c.original}</span>
                                                        <span className="text-white/40 mx-1.5">→</span>
                                                        <span className="text-emerald-400">{c.corrected}</span>
                                                    </div>
                                                    <div className="text-white/45 text-xs leading-relaxed">{c.explanation}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Vocabulary */}
                                {feedback.vocabulary.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <BookOpen className="w-3.5 h-3.5 text-gold" />
                                            <span className="text-xs font-semibold text-white/70">Better Words</span>
                                        </div>
                                        <div className="space-y-2">
                                            {feedback.vocabulary.map((v, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-gold/[0.07] border border-gold/20">
                                                    <div className="text-xs text-white/50 mb-1">&quot;{v.original}&quot; → try:</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {v.suggestions.map((s) => (
                                                            <span key={s} className="badge-gold">{s}</span>
                                                        ))}
                                                    </div>
                                                    <div className="text-white/35 text-xs mt-1.5">{v.context}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function ConversationPage() {
    return <Suspense><ConversationInner /></Suspense>
}
