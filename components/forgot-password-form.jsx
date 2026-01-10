"use client";

import { cn } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const supabase = getBrowserClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl border text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Check Your Email</CardTitle>
            <CardDescription className="text-white/60">Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/80 leading-relaxed">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
            <div className="mt-6">
              <Link
                href="/?auth=login"
                className="text-white hover:underline underline-offset-4 text-sm"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl border text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Reset Your Password</CardTitle>
            <CardDescription className="text-white/60">
              Type in your email and we&apos;ll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2 text-left">
                  <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-white/20 rounded-xl h-12"
                  />
                </div>
                {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset email"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-white/50">
                Already have an account?{" "}
                <Link
                  href="/?auth=login"
                  className="text-white underline underline-offset-4 hover:text-white/80 transition-colors"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}