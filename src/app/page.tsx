import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Users, Mail, Calendar } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-20">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Coordinate schedules with your{" "}
          <span className="text-primary">groups</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Availability Helper makes it easy to schedule events and coordinate
          availability within your groups. Create groups, invite members, and
          find the perfect time for everyone.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/signin">Get started</Link>
          </Button>
          <Button variant="link" asChild>
            <a href="#features">Learn more →</a>
          </Button>
        </div>
      </div>

      <div id="features" className="py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="size-6 text-primary-foreground" />
              </div>
              <CardTitle>
                <h3>Create Groups</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize your friends, family, or colleagues into groups for
                easy coordination.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-secondary w-12 h-12 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>
                <h3>Send Invitations</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Invite members to your groups via email with secure invitation
                links.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-accent w-12 h-12 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>
                <h3>Schedule Events</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create events and collect availability responses from all group
                members.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
