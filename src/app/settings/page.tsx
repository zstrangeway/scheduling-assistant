"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  LoadingSkeleton,
  Badge,
} from "@/components/ui";

export default function SettingsPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingSkeleton variant="detail" count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
            Account Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Profile Information</h4>
                <p className="text-sm text-muted-foreground">Update your name and profile details</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                id="email-invites"
                name="email-invites"
                type="checkbox"
                defaultChecked
                disabled
                className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="email-invites"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Group Invitations
                </label>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for group invitations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="email-events"
                name="email-events"
                type="checkbox"
                defaultChecked
                disabled
                className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="email-events"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Event Notifications
                </label>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for new events
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="email-reminders"
                name="email-reminders"
                type="checkbox"
                defaultChecked
                disabled
                className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="email-reminders"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Event Reminders
                </label>
                <p className="text-xs text-muted-foreground">
                  Receive email reminders for upcoming events
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                ℹ️ Notification preferences will be implemented in a future update.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Account Data</h4>
                <p className="text-sm text-muted-foreground">
                  Your account is secured with Google OAuth
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Secure
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Data Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export your personal data and activity
                </p>
              </div>
              <Button variant="secondary" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}