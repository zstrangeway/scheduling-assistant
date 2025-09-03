"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useGroupDetailStore } from "@/stores/group-detail.store";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Textarea,
} from "@/components/ui";

interface GroupSettingsFormProps {
  groupId: string;
}

interface FormMessage {
  type: "success" | "error";
  text: string;
}

export function GroupSettingsForm({ groupId }: GroupSettingsFormProps) {
  const { group, updateGroup } = useGroupDetailStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
    }
  }, [group]);

  if (!group) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateGroup(groupId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setMessage({ type: "success", text: "Group updated successfully!" });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update group",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    name.trim() !== group.name ||
    (description.trim() || "") !== (group.description || "");

  const isOwner = group.isOwner;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Group Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          disabled={isLoading || !isOwner}
          placeholder="Enter group name"
        />
        <p className="text-xs text-muted-foreground">
          {name.length}/100 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          disabled={isLoading || !isOwner}
          placeholder="Optional description for your group"
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/500 characters
        </p>
      </div>

      {!isOwner && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Only the group owner can modify these settings.
          </AlertDescription>
        </Alert>
      )}

      {isOwner && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !hasChanges || !name.trim()}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </form>
  );
}