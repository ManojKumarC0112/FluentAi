import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'FluentAI – AI English Speaking Coach',
    description: 'The world\'s most personalized AI English speaking coach. Practice conversations, get instant grammar feedback, and improve fluency with AI.',
    keywords: ['English speaking', 'AI coach', 'IELTS prep', 'fluency', 'grammar correction'],
    openGraph: {
        title: 'FluentAI – AI English Speaking Coach',
        description: 'Practice English conversations with AI. Get instant feedback, grammar corrections, and fluency scores.',
        type: 'website',
    },
}

import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider appearance={{ theme: shadcn }}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                </head>
                <body className="min-h-screen bg-navy-950 text-white antialiased">
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
