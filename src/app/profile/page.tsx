"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";
import { useUserStore } from "@/stores/user.store";
import { ProfileForm } from "@/components/features/profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSkeleton,
  ErrorState,
} from "@/components/ui";

export default function ProfilePage() {
  const { status } = useSession();
  const { profile, loading, error, fetchProfile, reset } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (status === "loading" || loading) {
    return <LoadingSkeleton variant="detail" count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Error loading profile"
        onRetry={fetchProfile}
      />
    );
  }

  if (!profile) {
    return (
      <ErrorState
        error="Profile not found"
        title="Profile not found"
        onRetry={fetchProfile}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
            Profile Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {profile.image && (
                  <Image
                    className="h-16 w-16 rounded-full"
                    src={profile.image}
                    alt={profile.name || "User"}
                    width={64}
                    height={64}
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Groups owned:</span>
                  <span className="font-medium">{profile._count.ownedGroups}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Group memberships:</span>
                  <span className="font-medium">{profile._count.memberships}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Events created:</span>
                  <span className="font-medium">{profile._count.createdEvents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Event responses:</span>
                  <span className="font-medium">{profile._count.responses}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm user={profile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}