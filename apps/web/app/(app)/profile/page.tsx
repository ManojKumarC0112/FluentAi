'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { User, Flame, Trophy, Zap, Target, Mic, Bell, Globe, ChevronRight, Edit3, Check, Star } from 'lucide-react'

export default function ProfilePage() {
    const { getToken, isLoaded } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'settings'>('profile')
    const [editName, setEditName] = useState(false)
    const [name, setName] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                    setName(json.user.name)
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [isLoaded])

    if (loading || !data) return <div className="p-8 text-white/50 text-center animate-pulse">Loading Profile Data...</div>

    return (
        <div className="p-6 md:p-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-emerald-400" />
                <h1 className="font-heading text-2xl font-bold text-white">Profile</h1>
            </div>

            {/* Profile card */}
            <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet to-violet-light flex items-center justify-center text-3xl shadow-glow-violet">
                            🧑‍💻
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-navy-950" />
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {editName ? (
                                <div className="flex items-center gap-2">
                                    <input value={name} onChange={(e) => setName(e.target.value)}
                                        className="input text-lg font-bold py-1.5 px-3 h-auto w-48" autoFocus />
                                    <button onClick={() => setEditName(false)} className="text-emerald-400">
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-heading font-bold text-xl text-white">{name}</h2>
                                    <button onClick={() => setEditName(true)} className="text-white/30 hover:text-white/60 transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="badge-violet">B1 Intermediate</span>
                            <span className="badge-gold">Daily Conversation</span>
                            <span className="badge-green">Free Plan</span>
                        </div>
                    </div>

                    {/* XP */}
                    <div className="text-center glass rounded-xl px-6 py-4">
                        <div className="font-heading font-bold text-3xl gradient-text-violet">{data.user.xp.toLocaleString()}</div>
                        <div className="text-white/40 text-sm">Total XP</div>
                        <div className="text-white/25 text-xs mt-1">Level {Math.floor(data.user.xp / 1000)} → {Math.floor(data.user.xp / 1000) + 1}</div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full mt-2 w-24 mx-auto overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet to-violet-light rounded-full" style={{ width: `${(data.user.xp % 1000) / 10}%` }} />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
                    {data.profileStats.map((s: any, i: number) => {
                        const Icon = i === 0 ? Flame : i === 1 ? Mic : i === 2 ? Star : Trophy;
                        const color = i === 0 ? 'text-orange-400' : i === 1 ? 'text-blue-400' : i === 2 ? 'text-violet-glow' : 'text-gold-light';
                        return (
                            <div key={s.label} className="text-center">
                                <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                                <div className={`font-heading font-bold text-xl ${color}`}>{s.value}</div>
                                <div className="text-white/50 text-xs">{s.label}</div>
                                <div className="text-white/25 text-xs mt-0.5">{s.sub}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/[0.06]">
                {(['profile', 'badges', 'settings'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-violet text-white' : 'border-transparent text-white/40 hover:text-white/70'
                            }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                    <h3 className="font-heading font-semibold text-white mb-4">Learning Settings</h3>
                    <div className="space-y-1">
                        {data.learningSettings.map((item: any, i: number) => {
                            const Icon = i === 0 ? Target : i === 1 ? Mic : i === 2 ? Flame : Globe;
                            return (
                                <div key={item.label}
                                    className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 text-white/40" />
                                        <span className="text-white/60 text-sm">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-sm font-medium">{item.value}</span>
                                        <ChevronRight className="w-4 h-4 text-white/25" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {activeTab === 'badges' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.badges.map((badge: any, i: number) => (
                            <motion.div key={badge.name}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.06 }}
                                className={`glass rounded-2xl p-4 text-center transition-all duration-200 ${badge.earned ? 'border-gold/30 hover:border-gold/50' : 'opacity-40 grayscale'
                                    }`}>
                                <div className="text-4xl mb-3">{badge.icon}</div>
                                <div className="font-semibold text-white text-sm mb-1">{badge.name}</div>
                                <div className="text-white/35 text-xs">{badge.desc}</div>
                                {badge.earned && <div className="badge-gold mt-2 justify-center w-fit mx-auto">Earned</div>}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-heading font-semibold text-white mb-4">Notifications</h3>
                        <div className="space-y-1">
                            {data.notifications.map((n: any) => (
                                <div key={n.label}
                                    className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-white text-sm font-medium">{n.label}</div>
                                            <div className="text-white/35 text-xs">{n.desc}</div>
                                        </div>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full border transition-colors cursor-pointer flex items-center ${n.enabled ? 'bg-violet border-violet' : 'bg-white/[0.06] border-white/15'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${n.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-heading font-semibold text-white mb-4">Account</h3>
                        <div className="space-y-1">
                            {['Change Password', 'Export My Data'].map((label) => (
                                <button key={label}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors text-sm flex items-center justify-between">
                                    {label} <ChevronRight className="w-4 h-4" />
                                </button>
                            ))}
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors text-sm">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
