'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { History, Search, Filter, Play, Star, Clock, Calendar, ChevronRight } from 'lucide-react'
import type { ConversationMode } from '@/lib/types'

const MODE_EMOJI: Record<ConversationMode, string> = {
    normal_chat: '💬', interview: '💼', ielts: '🎓',
    roleplay: '🎭', storytelling: '📖', debate: '⚡', presentation: '🎯',
}

function formatDuration(s: number) {
    const m = Math.floor(s / 60); return `${m} min`
}

function ScoreBadge({ value }: { value: number }) {
    const color = value >= 8.5 ? 'text-emerald-400' : value >= 7.5 ? 'text-violet-glow' : 'text-gold-light'
    return <span className={`font-heading font-bold ${color}`}>{value.toFixed(1)}</span>
}

export default function HistoryPage() {
    const { getToken, isLoaded } = useAuth()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<ConversationMode | 'all'>('all')
    const [selected, setSelected] = useState<any | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/history/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const json = await res.json()
                    setHistory(json)
                }
            } catch (err) {
                console.error("Failed to fetch history:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [isLoaded])

    if (loading) return <div className="p-8 text-white/50 animate-pulse text-center">Loading Session History...</div>

    const filtered = history.filter((s) =>
        (filter === 'all' || s.mode === filter) &&
        (s.topic.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="p-6 md:p-8 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-blue-400" />
                <h1 className="font-heading text-2xl font-bold text-white">Session History</h1>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search sessions…" className="input pl-10" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'normal_chat', 'interview', 'ielts', 'debate', 'roleplay'] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${filter === f ? 'bg-violet/20 border-violet/50 text-violet-glow' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white'
                                }`}>
                            {f === 'all' ? 'All' : f === 'normal_chat' ? '💬 Chat' : f === 'interview' ? '💼 Interview' : f === 'ielts' ? '🎓 IELTS' : f === 'debate' ? '⚡ Debate' : '🎭 Roleplay'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* List */}
                <div className="space-y-3">
                    {filtered.map((s, i) => (
                        <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            onClick={() => setSelected(selected?.id === s.id ? null : s)}
                            className={`glass-hover p-4 cursor-pointer transition-all duration-200 ${selected?.id === s.id ? 'border-violet/50 bg-violet/10' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{MODE_EMOJI[s.mode]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-white text-sm truncate">{s.topic}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(s.duration)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="text-center">
                                        <ScoreBadge value={s.fluency} />
                                        <div className="text-white/25 text-xs">fluency</div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-white/20 transition-transform ${selected?.id === s.id ? 'rotate-90 text-violet-glow' : ''}`} />
                                </div>
                            </div>

                            {/* Expanded row stats */}
                            {selected?.id === s.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="font-heading font-bold text-base text-blue-400">{s.grammar.toFixed(1)}</div>
                                        <div className="text-white/30 text-xs">Grammar</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-heading font-bold text-base text-emerald-400">{s.vocabulary.toFixed(1)}</div>
                                        <div className="text-white/30 text-xs">Vocab</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-heading font-bold text-base text-gold-light">{s.words}</div>
                                        <div className="text-white/30 text-xs">Words</div>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-2 mt-1">
                                        <button className="btn-secondary text-xs py-2 px-3 flex-1 justify-center"><Play className="w-3 h-3" /> Replay</button>
                                        <div className="text-white/30 text-xs">{s.corrections} correction{s.corrections !== 1 ? 's' : ''}</div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-white/30">
                            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No sessions found</p>
                        </div>
                    )}
                </div>

                {/* Summary stats */}
                <div className="space-y-4 hidden lg:block">
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-gold" />
                            <h3 className="font-heading font-semibold text-white text-sm">Overall Stats</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Sessions', value: history.length.toString(), color: 'text-white' },
                                { label: 'Avg Fluency', value: history.length > 0 ? (history.reduce((a, s) => a + s.fluency, 0) / history.length).toFixed(1) : '0', color: 'text-violet-glow' },
                                { label: 'Total Words', value: history.reduce((a, s) => a + s.words, 0).toLocaleString(), color: 'text-emerald-400' },
                                { label: 'Corrections', value: history.reduce((a, s) => a + s.corrections, 0).toString(), color: 'text-gold-light' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass rounded-xl p-3 text-center">
                                    <div className={`font-heading font-bold text-xl ${stat.color}`}>{stat.value}</div>
                                    <div className="text-white/35 text-xs mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-5">
                        <h3 className="font-heading font-semibold text-white text-sm mb-3">Mode Breakdown</h3>
                        <div className="space-y-2">
                            {['interview', 'normal_chat', 'ielts', 'debate'].map((m) => {
                                const count = history.filter((s) => s.mode === m).length
                                const pct = history.length > 0 ? Math.round((count / history.length) * 100) : 0
                                return (
                                    <div key={m} className="flex items-center gap-3">
                                        <span className="text-base">{MODE_EMOJI[m as ConversationMode]}</span>
                                        <div className="flex-1">
                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-violet to-violet-light rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-white/40 text-xs w-6 text-right">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
