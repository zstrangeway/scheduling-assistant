"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useEffect } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const { user, loading, signOut, setUser, setLoading } = useAuthStore();

  // Sync NextAuth session with our auth store
  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          name: session.user.name,
          email: session.user.email || "",
          image: session.user.image,
        });
      } else {
        setUser(null);
      }
    }
  }, [session, status, setUser, setLoading]);

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="font-bold text-xl text-primary">
            Availability Helper
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <div className="animate-pulse bg-muted rounded h-8 w-20"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-6">
        <Link href="/" className="font-bold text-xl text-primary">
          Availability Helper
        </Link>

        {user && (
          <nav className="ml-8 flex space-x-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/groups"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Groups
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
