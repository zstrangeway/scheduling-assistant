import { Badge } from "@/components/ui";

interface InviteCardProps {
  invite: {
    id: string;
    email: string;
    status: string;
    createdAt: Date | string;
    expiresAt: Date | string;
  };
}

export function InviteCard({ invite }: InviteCardProps) {
  const isExpired = new Date(invite.expiresAt) <= new Date();
  const isPending = invite.status === "PENDING" && !isExpired;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <p className="text-sm font-medium">{invite.email}</p>
        <p className="text-xs text-muted-foreground">
          Invited {new Date(invite.createdAt).toLocaleDateString()} • Expires{" "}
          {new Date(invite.expiresAt).toLocaleDateString()}
        </p>
      </div>
      <Badge
        variant={
          isPending
            ? "secondary"
            : invite.status === "ACCEPTED"
            ? "default"
            : "destructive"
        }
      >
        {isExpired && invite.status === "PENDING"
          ? "Expired"
          : invite.status.toLowerCase()}
      </Badge>
    </div>
  );
}
