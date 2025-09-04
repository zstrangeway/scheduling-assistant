"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useGroupDetailStore } from "@/stores/group-detail.store";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSkeleton,
  ErrorState,
} from "@/components/ui";
import { GroupSettingsForm } from "@/components/features/groups";
import Link from "next/link";

export default function GroupSettingsPage() {
  const { status } = useSession();
  const params = useParams();
  const groupId = params.id as string;
  const { group, loading, error, fetchGroup, reset } = useGroupDetailStore();

  useEffect(() => {
    if (groupId) {
      fetchGroup(groupId);
    }
  }, [groupId, fetchGroup]);

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
        title="Error loading group"
        onRetry={() => fetchGroup(groupId)}
      />
    );
  }

  if (!group) {
    return (
      <ErrorState
        error="Group not found or you don't have permission to access settings"
        title="Group not found"
        onRetry={() => fetchGroup(groupId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-3">
            <Link href={`/groups/${group.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
              Group Settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure settings for &quot;{group.name}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupSettingsForm groupId={group.id} />
        </CardContent>
      </Card>
    </div>
  );
}
