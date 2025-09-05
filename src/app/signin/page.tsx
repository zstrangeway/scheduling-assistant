import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/features/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (session) {
    redirect(params.callbackUrl || "/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Sign in to Availability Helper
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Coordinate schedules with your groups
            </p>
          </CardHeader>
          <CardContent>
            <SignInForm callbackUrl={params.callbackUrl || "/"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}