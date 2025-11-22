"use client";
import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

interface InviteMemberComponentProps {
  teamId: string;
  onClose?: () => void;
}

const InviteMemberComponent: React.FC<InviteMemberComponentProps> = ({
  teamId,
  onClose,
}) => {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("member");
      onClose?.();
    } catch (err: any) {
      setError("Failed to send invitation. Please try again.");
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Invite Team Member
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          Send an invitation to join this team via email.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleInvite} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="member-email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="member-email"
              type="email"
              placeholder="colleague@example.com"
              className="pm-input pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-role" className="text-sm font-medium text-gray-700">
            Role
          </Label>
          <select
            id="member-role"
            className="pm-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Members can view and edit tasks. Admins can manage members. Owners have full control.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="submit"
            className="pm-button-primary w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default InviteMemberComponent;

