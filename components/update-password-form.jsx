"use client";

import { cn } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({ className, ...props }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const supabase = getBrowserClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
 
      router.push("/protected");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl shadow-2xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-white/60">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2 text-left">
                <Label htmlFor="password" className="text-white/80 ml-1">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-white/20 rounded-xl h-12"
                />
              </div>
              {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}
              <Button 
                type="submit" 
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}