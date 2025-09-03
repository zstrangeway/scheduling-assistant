"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar, Plus } from "lucide-react";
import { useGroupsStore } from "@/stores/groups.store";
import { Button, Card, CardContent } from "@/components/ui";
import { CreateGroupDialog } from "@/components/features/groups";
import { ErrorState, LoadingSkeleton } from "@/components/ui";

interface Group {
  id: string;
  name: string;
  description?: string | null;
  owner: {
    id: string;
    name?: string | null;
    email: string;
  };
  _count: {
    members: number;
    events: number;
  };
  createdAt: Date | string;
}

interface GroupCardProps {
  group: Group;
  isOwner: boolean;
  currentUserId: string;
}

function GroupCard({ group, isOwner }: GroupCardProps) {
  const totalMembers = group._count.members + (isOwner ? 1 : 0); // Owner + members

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium truncate">{group.name}</h4>
            {isOwner && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Owner
              </span>
            )}
          </div>

          {group.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {group.description}
            </p>
          )}

          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            </div>

            <div className="ml-4 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {group._count.events} event{group._count.events !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Created by {group.owner.name || group.owner.email}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No groups yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first group.
        </p>
        <div className="mt-6">
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupSection({
  title,
  groups,
  currentUserId,
}: {
  title: string;
  groups: Group[];
  currentUserId: string;
}) {
  if (groups.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        {title} ({groups.length})
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isOwner={group.owner.id === currentUserId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { groups, loading, error, fetchGroups, reset } = useGroupsStore();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/signin");
    }

    fetchGroups();
  }, [session, status, fetchGroups]);

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
        title="Error loading groups"
        onRetry={fetchGroups}
      />
    );
  }

  const ownedGroups = groups.filter(
    (group) => group.owner.id === session?.user?.id
  );
  const memberGroups = groups.filter(
    (group) => group.owner.id !== session?.user?.id
  );

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
            Groups
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your groups and coordinate schedules
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState onCreateGroup={() => setIsCreateDialogOpen(true)} />
      ) : (
        <div className="space-y-8">
          <GroupSection
            title="Groups You Own"
            groups={ownedGroups}
            currentUserId={session?.user?.id || ""}
          />
          <GroupSection
            title="Groups You're In"
            groups={memberGroups}
            currentUserId={session?.user?.id || ""}
          />
        </div>
      )}

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
