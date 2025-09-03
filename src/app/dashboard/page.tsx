"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Mail } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard.store";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const {
    data: dashboardData,
    loading,
    error,
    fetchDashboardData,
    reset,
  } = useDashboardStore();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/signin");
      return;
    }

    fetchDashboardData();
  }, [session, status, fetchDashboardData]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse flex items-center">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="ml-5 flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
            Welcome back, {session.user?.name}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your groups and coordinate schedules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Groups
                </dt>
                <dd className="text-lg font-medium">
                  {dashboardData?.totalGroups || 0}
                </dd>
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-foreground" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Upcoming Events
                </dt>
                <dd className="text-lg font-medium">
                  {dashboardData?.upcomingEvents || 0}
                </dd>
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Pending Invites
                </dt>
                <dd className="text-lg font-medium">
                  {dashboardData?.pendingInvites || 0}
                </dd>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl text-sm text-muted-foreground">
            <p>
              Welcome to Availability Helper! Get started by creating your first
              group or accepting an invitation.
            </p>
          </div>
          <div className="mt-5 flex space-x-3">
            <Button asChild>
              <Link href="/groups">Create your first group</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">Complete Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
