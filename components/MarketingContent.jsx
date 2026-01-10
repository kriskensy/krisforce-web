import Link from "next/link";
import { CheckCircle2, BarChart3, Users2, Zap, ShieldCheck } from "lucide-react";

export function MarketingContent() {
  return (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl ring-1 ring-black/5 w-full max-w-5xl mx-auto">
      
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          KrisForce 2.0 Ecosystem
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Everything you need to manage, scale, and automate your business operations in one beautiful interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 text-left">
        <FeatureItem 
          icon={<Users2 className="text-blue-400" />}
          title="Advanced CRM"
          description="Manage leads and customer relationships."
        />
        <FeatureItem 
          icon={<BarChart3 className="text-emerald-400" />}
          title="Real-time Analytics"
          description="Track your performance with dynamic charts and custom reports."
        />
        <FeatureItem 
          icon={<ShieldCheck className="text-purple-400" />}
          title="Enterprise Security"
          description="Bank-grade encryption."
        />
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center text-center">
          <p className="text-white font-semibold mb-2">Ready to explore?</p>
          <Link href="/?auth=signup" className="text-sm text-blue-400 underline underline-offset-4 hover:text-blue-300">
            Create account
          </Link>
        </div>
      </div>

      <div className="flex justify-center border-t border-white/10 pt-8">
        <Link 
          href="/" 
          className="bg-white text-black hover:bg-zinc-200 px-10 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

//helper component
function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}