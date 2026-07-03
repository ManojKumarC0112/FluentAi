import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-violet/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md flex justify-center">
                <SignIn fallbackRedirectUrl="/conversation" appearance={{ elements: { rootBox: "mx-auto" } }} />
            </div>

        </div>
    )
}
