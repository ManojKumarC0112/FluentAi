'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Mic, Target, Zap } from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line
} from 'recharts'

const TOOLTIP_STYLE = {
    background: '#0F1A3E', border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 12, color: '#fff',
}

export default function AnalyticsPage() {
    const { getToken, isLoaded } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState<'week' | 'month' | '3month'>('week')

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/trends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (err) {
                console.error("Failed to fetch analytics:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [isLoaded])

    if (loading || !data) return <div className="p-8 text-white/50 text-center animate-pulse">Loading Analytics Data...</div>

    return (
        <div className="p-6 md:p-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-violet-glow" />
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-white">Analytics</h1>
                        <p className="text-white/40 text-sm">Your speaking progress over time</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month', '3month'] as const).map((r) => (
                        <button key={r} onClick={() => setRange(r)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${range === r ? 'bg-violet/20 border-violet/50 text-violet-glow' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white'
                                }`}>
                            {r === 'week' ? '7D' : r === 'month' ? '30D' : '3M'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: Mic, label: 'Hours Spoken', value: '4.2h', sub: '+1.2h vs last week', color: 'from-violet to-violet-light', textColor: 'text-violet-glow' },
                    { icon: BookOpen, label: 'New Words', value: '84', sub: '+22 vs last week', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
                    { icon: Target, label: 'Grammar Accuracy', value: '91%', sub: '+3% vs last week', color: 'from-blue-500 to-violet', textColor: 'text-blue-400' },
                    { icon: Zap, label: 'Avg WPM', value: '129', sub: 'Target: 120–160', color: 'from-gold to-orange-500', textColor: 'text-gold-light' },
                ].map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="glass rounded-2xl p-5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3`}>
                            <m.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className={`font-heading font-bold text-2xl ${m.textColor}`}>{m.value}</div>
                        <div className="text-white/50 text-sm mt-0.5">{m.label}</div>
                        <div className="text-white/25 text-xs mt-1">{m.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Score trend */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-violet-glow" />
                        <h2 className="font-heading font-semibold text-white">Score Trends</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.weeklyTrend}>
                            <defs>
                                {[['fluency', '#7C3AED'], ['grammar', '#3B82F6'], ['vocabulary', '#10B981']].map(([key, color]) => (
                                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[6, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Area type="monotone" dataKey="fluency" stroke="#8B5CF6" strokeWidth={2} fill="url(#grad-fluency)" dot={false} name="Fluency" />
                            <Area type="monotone" dataKey="grammar" stroke="#3B82F6" strokeWidth={2} fill="url(#grad-grammar)" dot={false} name="Grammar" />
                            <Area type="monotone" dataKey="vocabulary" stroke="#10B981" strokeWidth={2} fill="url(#grad-vocabulary)" dot={false} name="Vocabulary" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-3 justify-center">
                        {[['Fluency', '#8B5CF6'], ['Grammar', '#3B82F6'], ['Vocabulary', '#10B981']].map(([label, color]) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div className="w-3 h-0.5 rounded-full" style={{ background: color }} />
                                <span className="text-white/40 text-xs">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radar */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-heading font-semibold text-white mb-5">Skills Overview</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={data.radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                            <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Daily speaking time */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-heading font-semibold text-white mb-5">Speaking Time (min)</h2>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data.dailySpeaking} barSize={28}>
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} min`, 'Speaking']} />
                            <Bar dataKey="minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* WPM trend */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-heading font-semibold text-white">Speaking Speed (WPM)</h2>
                        <span className="badge-gold">Target 120–160</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data.wpmTrend}>
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[100, 160]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} WPM`, 'Speed']} />
                            {/* Target zone */}
                            <Line type="monotone" dataKey={() => 120} stroke="rgba(245,158,11,0.3)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                            <Line type="monotone" dataKey={() => 160} stroke="rgba(245,158,11,0.3)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                            <Line type="monotone" dataKey="wpm" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Grammar errors breakdown */}
            <div className="glass rounded-2xl p-6">
                <h2 className="font-heading font-semibold text-white mb-5">Grammar Error Breakdown</h2>
                <div className="space-y-3">
                    {data.grammarErrors.map((e: any) => {
                        const max = data.grammarErrors[0].count
                        const pct = (e.count / max) * 100
                        return (
                            <div key={e.category} className="flex items-center gap-4">
                                <div className="w-28 text-white/60 text-sm flex-shrink-0">{e.category}</div>
                                <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full" />
                                </div>
                                <div className="w-8 text-right text-white/40 text-sm">{e.count}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
