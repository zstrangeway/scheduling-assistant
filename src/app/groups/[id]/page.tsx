"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, Calendar, ArrowLeft, Mail, Plus } from "lucide-react";
import { useGroupDetailStore } from "@/stores/group-detail.store";
import { EventList, CreateEventDialog } from "@/components/features/events";
import {
  MemberCard,
  InviteCard,
  GroupActions,
  InviteMembersDialog,
} from "@/components/features/groups";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingSkeleton,
  Separator,
} from "@/components/ui";

interface GroupMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date | string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export default function GroupDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const groupId = params.id as string;
  const { group, loading, error, fetchGroup, reset } = useGroupDetailStore();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);

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
        error="Group not found"
        title="Group not found"
        onRetry={() => fetchGroup(groupId)}
      />
    );
  }

  const pendingInvites = group.invites.filter(
    (invite) =>
      invite.status === "PENDING" && new Date(invite.expiresAt) > new Date()
  );

  const processedInvites = group.invites.filter(
    (invite) =>
      invite.status !== "PENDING" || new Date(invite.expiresAt) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-3">
              <Link href="/groups">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
                {group.name}
              </h2>
              {group.isOwner && <Badge>Owner</Badge>}
            </div>
          </div>
          {group.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}
          <div className="mt-2 flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.totalMembers} member{group.totalMembers !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {group._count.events} event{group._count.events !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-muted-foreground">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <GroupActions
            group={{
              id: group.id,
              name: group.name,
              ownerId: group.owner.id,
            }}
            isOwner={group.isOwner}
            isMember={group.isMember}
            currentUserId={session?.user?.id || ""}
          />
        </div>
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            Members ({group.totalMembers})
          </CardTitle>
          {group.isOwner && (
            <Button onClick={() => setInviteDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* Owner */}
            <MemberCard user={group.owner} isOwner={true} />

            {/* Members */}
            {group.members.map((membership: GroupMember) => (
              <MemberCard
                key={membership.id}
                user={membership.user}
                role={membership.role}
                joinedAt={membership.joinedAt}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations - Only show to owners */}
      {group.isOwner && group.invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Pending Invitations ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvites.length > 0 ? (
              <div className="space-y-0">
                {pendingInvites.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending invitations
              </p>
            )}

            {processedInvites.length > 0 && (
              <>
                <Separator className="my-4" />
                <details>
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Show processed invitations ({processedInvites.length})
                  </summary>
                  <div className="mt-3 space-y-0">
                    {processedInvites.map((invite) => (
                      <InviteCard key={invite.id} invite={invite} />
                    ))}
                  </div>
                </details>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Events ({group._count.events})
          </CardTitle>
          {(group.isOwner || group.isMember) && (
            <Button onClick={() => setCreateEventDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <EventList
            groupId={group.id}
            groupOwnerId={group.owner.id}
            events={group.events.map(event => ({
              ...event,
              startTime: event.startTime.toISOString(),
              endTime: event.endTime.toISOString()
            }))}
            onEventDeleted={() => fetchGroup(groupId)}
            onEventUpdated={() => fetchGroup(groupId)}
          />
        </CardContent>
      </Card>

      {/* Invite Members Dialog */}
      <InviteMembersDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        groupId={group.id}
        groupName={group.name}
      />

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createEventDialogOpen}
        onOpenChange={setCreateEventDialogOpen}
        groupId={group.id}
        onEventCreated={() => fetchGroup(groupId)}
      />
    </div>
  );
}
