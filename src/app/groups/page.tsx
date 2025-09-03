"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CreateGroupDialog } from "@/components";
import { Users, Calendar, Plus } from "lucide-react";
import { useGroupsStore } from "@/stores/groups.store";

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    groups,
    loading,
    error,
    fetchGroups,
    reset,
  } = useGroupsStore();

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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading groups: {error}</p>
          <Button onClick={fetchGroups} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const ownedGroups = groups.filter(group => group.owner.id === session.user.id)
  const memberGroups = groups.filter(group => group.owner.id !== session.user.id)

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
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No groups yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first group.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {ownedGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Groups You Own ({ownedGroups.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ownedGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    isOwner={true}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}

          {memberGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Groups You're In ({memberGroups.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {memberGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    isOwner={false}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateGroupDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}

interface GroupCardProps {
  group: {
    id: string
    name: string
    description?: string | null
    owner: {
      id: string
      name?: string | null
      email: string
    }
    _count: {
      members: number
      events: number
    }
    createdAt: Date | string
  }
  isOwner: boolean
  currentUserId: string
}

function GroupCard({ group, isOwner }: GroupCardProps) {
  const totalMembers = group._count.members + (isOwner ? 1 : 0) // Owner + members

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium truncate">
              {group.name}
            </h4>
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
              {totalMembers} member{totalMembers !== 1 ? 's' : ''}
            </div>
            
            <div className="ml-4 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {group._count.events} event{group._count.events !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Created by {group.owner.name || group.owner.email}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}