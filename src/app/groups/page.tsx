"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useGroupsStore } from "@/stores/groups.store";
import { Button } from "@/components/ui";
import { LoadingSkeleton, ErrorState } from "@/components/ui/templates";
import { 
  CreateGroupDialog, 
  GroupSection, 
  GroupsEmptyState 
} from "@/components/features/groups";

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { groups, loading, error, fetchGroups, reset } = useGroupsStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
        <GroupsEmptyState onCreateGroup={() => setIsCreateDialogOpen(true)} />
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
