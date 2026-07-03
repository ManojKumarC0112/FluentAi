/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                navy: {
                    950: '#060B18',
                    900: '#0A1228',
                    800: '#0F1A3E',
                    700: '#162050',
                },
                violet: {
                    DEFAULT: '#7C3AED',
                    light: '#8B5CF6',
                    glow: '#A78BFA',
                },
                gold: {
                    DEFAULT: '#F59E0B',
                    light: '#FCD34D',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.25) 0%, transparent 60%)',
                'card-glow': 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,11,24,0.5) 100%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'waveform': 'waveform 1s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                waveform: {
                    '0%, 100%': { transform: 'scaleY(0.3)' },
                    '50%': { transform: 'scaleY(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(124,58,237,0.6)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            boxShadow: {
                'glow-violet': '0 0 30px rgba(124, 58, 237, 0.4)',
                'glow-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            },
        },
    },
    plugins: [],
}
