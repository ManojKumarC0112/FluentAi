'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-navy-950 flex">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <motion.main
                animate={{ marginLeft: collapsed ? 72 : 240 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex-1 min-h-screen overflow-x-hidden"
            >
                {children}
            </motion.main>
        </div>
    )
}
