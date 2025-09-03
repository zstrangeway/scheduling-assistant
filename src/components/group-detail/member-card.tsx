import { Avatar, AvatarImage, AvatarFallback, Badge } from "@/components";

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

interface MemberCardProps {
  user: User;
  role?: string;
  joinedAt?: Date | string;
  isOwner?: boolean;
}

export function MemberCard({ user, role, joinedAt, isOwner = false }: MemberCardProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image || ""} alt={user.name || ""} />
          <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user.name || user.email}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={isOwner ? "default" : "secondary"}>
          {isOwner ? "Owner" : role?.toLowerCase() || "member"}
        </Badge>
        {joinedAt && !isOwner && (
          <span className="text-xs text-muted-foreground">
            Joined {new Date(joinedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}