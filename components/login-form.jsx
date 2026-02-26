"use client";

import { cn } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/supabase/domains/auth/login";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    const supabase = getBrowserClient();
    setIsLoading(true);
    setError(null);

    try {
        await loginUser(email, password)
        router.push("/");
        // router.push("/protected");
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl ring-1 ring-black/5">
        
        <div className="flex flex-col gap-2 mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-white/60">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 transition-all rounded-xl h-12"
            />
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" university className="text-white/80">Password</Label>
              <Link
                href="/?auth=forgot-password"
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/20 transition-all rounded-xl h-12"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}

          <Button 
            type="submit" 
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-transform active:scale-95" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="pt-4 text-center text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/?auth=signup" className="text-white hover:underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}