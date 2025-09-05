"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useInviteStore } from "@/stores/invite.store";
import {
  ErrorState,
  LoadingSkeleton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { Mail, Users, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function InvitePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const {
    invite,
    loading,
    error,
    processing,
    result,
    redirecting,
    fetchInvite,
    processInvite,
    reset,
  } = useInviteStore();

  useEffect(() => {
    if (token) {
      fetchInvite(token);
    }
  }, [token, fetchInvite]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleInvitation = (action: 'accept' | 'decline') => {
    processInvite(token, action, (url) => router.push(url));
  };

  if (status === "loading" || loading) {
    return <LoadingSkeleton variant="detail" count={3} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          error={error}
          title="Error loading invitation"
          onRetry={() => fetchInvite(token)}
        />
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="space-y-6">
        <ErrorState
          error="Invitation not found"
          title="Invitation not found"
          onRetry={() => fetchInvite(token)}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 text-primary mb-4">
              <Mail className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl">Sign in Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              You need to sign in to accept this invitation to join &quot;{invite.group.name}&quot;.
            </p>
            <p className="text-xs text-muted-foreground">
              Invitation sent to: {invite.email}
            </p>
            <Button asChild className="w-full">
              <Link href={`/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}>
                Sign In to Continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success/Error Results
  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 text-primary mb-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl">Invitation Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {result.alreadyMember
                  ? "You are already a member of this group!"
                  : result.message}
                {redirecting && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {result.groupId
                      ? "Redirecting you to the group..."
                      : "Redirecting you to home..."}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-primary mb-4">
          <Users className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl">
          Group Invitation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve been invited to join &quot;{invite.group.name}&quot;
        </p>
      </div>

      {/* Invitation Details */}
      <Card>
        <CardHeader>
          <CardTitle>{invite.group.name}</CardTitle>
          {invite.group.description && (
            <p className="text-sm text-muted-foreground">
              {invite.group.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 pt-4 border-t">
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Invited by
              </dt>
              <dd className="text-sm">
                {invite.sender.name || invite.sender.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Invitation sent to
              </dt>
              <dd className="text-sm">{invite.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Expires
              </dt>
              <dd className="text-sm">
                {new Date(invite.expiresAt).toLocaleDateString()} at{" "}
                {new Date(invite.expiresAt).toLocaleTimeString()}
              </dd>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t">
            <Button
              onClick={() => handleInvitation("accept")}
              disabled={processing || redirecting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleInvitation("decline")}
              disabled={processing || redirecting}
              className="w-full"
            >
              {processing ? "Processing..." : "Decline Invitation"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This invitation was sent to {invite.email}. Make sure you&apos;re signed
            in with the correct account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}