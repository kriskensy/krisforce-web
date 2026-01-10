import Link from "next/link"

export const SignUpSuccess = () => {
  return (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl ring-1 ring-black/5 text-center">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Thank you!
        </h2>
        <p className="text-sm text-white/60">
          Check your email to confirm your account
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-white/80 leading-relaxed">
          You&apos;ve successfully signed up. Please check your email to
          confirm your account before signing in.
        </p>
        
        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-block text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition-colors text-sm font-medium border border-white/10"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}