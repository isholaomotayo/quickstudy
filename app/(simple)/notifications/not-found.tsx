import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Bell, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotificationsNotFound() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-sky-500 to-emerald-400 bg-clip-text text-transparent">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mt-2">
          The notifications page you're looking for doesn't exist.
        </p>
      </div>

      {/* Not Found Card */}
      <GlassCard className="text-center py-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              404 - Page Not Found
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved or no longer exists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gap-2">
              <Link href="/notifications">
                <Bell className="w-4 h-4" />
                View Notifications
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Suggestions */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            You might be looking for:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              href="/notifications" 
              className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">View all your notifications</p>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/" 
              className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Dashboard</p>
                  <p className="text-sm text-muted-foreground">Return to your dashboard</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
