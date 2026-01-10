"use client";

import { cn } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event) => {
    event.preventDefault();
    const supabase = getBrowserClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/?auth=sign-up-success");
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
            Create Account
          </h2>
          <p className="text-sm text-white/60">
            Join us by filling out the form below
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 transition-all rounded-xl h-11"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" university className="text-white/80 ml-1">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/20 transition-all rounded-xl h-11"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="repeat-password" university className="text-white/80 ml-1">Repeat Password</Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/20 transition-all rounded-xl h-11"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}

          <Button 
            type="submit" 
            className="w-full h-12 mt-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-transform active:scale-95 shadow-lg" 
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="pt-4 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/?auth=login" className="text-white hover:underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}