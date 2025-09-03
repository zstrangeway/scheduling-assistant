"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { LoadingSkeleton, ErrorState } from "@/components/ui/templates";
import { Users, Calendar, Mail } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard.store";
import { StatCard } from "@/components/features/dashboard";

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
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  if (status === "loading" || loading) {
    return <LoadingSkeleton variant="cards" count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Error loading dashboard"
        onRetry={fetchDashboardData}
      />
    );
  }

  const stats = [
    {
      title: "Groups",
      value: dashboardData?.totalGroups || 0,
      icon: Users,
      bgColor: "bg-primary",
      iconColor: "text-primary-foreground",
    },
    {
      title: "Upcoming Events",
      value: dashboardData?.upcomingEvents || 0,
      icon: Calendar,
      bgColor: "bg-secondary",
      iconColor: "text-secondary-foreground",
    },
    {
      title: "Pending Invites",
      value: dashboardData?.pendingInvites || 0,
      icon: Mail,
      bgColor: "bg-accent",
      iconColor: "text-accent-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
            Welcome back, {session?.user?.name}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your groups and coordinate schedules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
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
