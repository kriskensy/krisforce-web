'use client';

import { useState, useEffect } from "react";
import { Settings, User, LogOut, Loader2, idCard, ShieldCheck, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsMenu({ user }) {
  const supabase = getBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', role: '' });

  //fetch data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, users!inner (role_id, roles (name))')
            .eq('user_id', user.id)
            .maybeSingle();

          if (data) {
            setProfile({
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              role: data.users?.roles?.name || 'User'
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsInitialLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, supabase]);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
        }, {
          onConflict: 'user_id'
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated!");
      setIsEditOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const showMissingInfoAlert = !isInitialLoading && (!profile.first_name?.trim() || !profile.last_name?.trim());

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Settings className="h-5 w-5" />
            {showMissingInfoAlert && (
               <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 border-2 border-white dark:border-[#161B22]" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsViewOpen(true)} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* display profile */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Account Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Full Name</p>
                  <p className="text-sm">{profile.first_name || '—'} {profile.last_name || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Role</p>
                  <p className="text-sm font-medium">{profile.role}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* edit profile */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                value={profile.first_name || ''} 
                onChange={(event) => setProfile({...profile, first_name: event.target.value})}
                placeholder="Your Firstname"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                value={profile.last_name || ''} 
                onChange={(event) => setProfile({...profile, last_name: event.target.value})}
                placeholder="Your Lastname"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}