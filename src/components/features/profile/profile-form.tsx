"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/user.store";
import {
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { CheckCircle, Loader2 } from "lucide-react";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  user: UserProfile;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { updateProfile } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateProfile({ name });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email address cannot be changed as it&apos;s linked to your Google account.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || name.trim() === user.name}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
