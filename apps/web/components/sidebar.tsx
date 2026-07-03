'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic, LayoutDashboard, MessageSquare, History,
    BarChart3, User, Settings, Flame, Trophy, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/conversation', label: 'Practice', icon: MessageSquare },
    { href: '/history', label: 'History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname()

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen flex flex-col bg-navy-900 border-r border-white/[0.06] z-40 overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-violet-light flex items-center justify-center shadow-glow-violet flex-shrink-0">
                    <Mic className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="font-heading font-bold text-lg text-white whitespace-nowrap">
                            FluentAI
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link key={href} href={href}
                            title={collapsed ? label : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${active
                                ? 'bg-violet/20 text-white border border-violet/30'
                                : 'text-white/45 hover:text-white hover:bg-white/[0.06]'
                                }`}>
                            <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-violet-glow' : 'group-hover:text-white'}`} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="text-sm font-medium whitespace-nowrap">
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )
                })}
            </nav>

            {/* Streak widget */}
            {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mx-3 mb-3 p-3 glass rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-semibold text-white">7 Day Streak!</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-gold rounded-full" style={{ width: '70%' }} />
                    </div>
                    <p className="text-white/30 text-xs mt-1">3 more days to next badge</p>
                </motion.div>
            )}

            {/* Bottom */}
            <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3 flex-shrink-0">
                <Link href="/profile?tab=settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                </Link>
                <SignOutButton redirectUrl="/">
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                    </button>
                </SignOutButton>
            </div>

            {/* Collapse toggle */}
            <button onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-violet/40 transition-all duration-200 z-50">
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
        </motion.aside>
    )
}
