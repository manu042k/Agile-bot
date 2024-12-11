import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import teamService from "@/services/teamService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Team, TeamMemberRole } from "@/types/project";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User } from "@/types/user";
import userInfoService from "@/services/userInfoService";
import toast from "react-hot-toast";

const TeamMemberPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTeam = async () => {
    try {
      if (!teamId) return;
      const response = await teamService.getTeam(teamId);
      setTeam(response);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userInfoService.getUsers();
      if (team) {
        // Filter users not in the team
        const filteredUsers = response.filter(
          (user) =>
            !team.members.some((member) => member.user.email === user.email)
        );
        setUsers(filteredUsers);
      } else {
        setUsers(response);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchUsers();
  }, [teamId, team]);

  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole || !teamId) return;

    try {
      await teamService.addMember(parseInt(teamId), {
        user_email: selectedUser,
        role: selectedRole,
      });
      toast.success("Member added successfully");
      setSelectedUser(undefined);
      setSelectedRole(null);
      setIsDialogOpen(false);
      await fetchTeam();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add member");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!teamId) return;

    try {
      await teamService.removeMember(parseInt(teamId), userId);
      await fetchTeam();
      toast.success("Member removed successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">
            {team?.name}
          </h1>
          <p className="text-lg text-gray-600">{team?.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="lg">
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="user" className="font-medium mb-1">
                  Select User
                </label>
                <Select
                  value={selectedUser}
                  onValueChange={(value) => setSelectedUser(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.email} value={user.email}>
                        {user.first_name} {user.last_name} : {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="role" className="font-medium mb-1">
                  Select Role
                </label>
                <Select
                  value={selectedRole || ""}
                  onValueChange={(value) =>
                    setSelectedRole(value as TeamMemberRole)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TeamMemberRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleAddMember}>Add</Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Table */}
      <Table className="w-full overflow-x-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team?.members.map((member) => (
            <TableRow key={member.user.email}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={member.user.profile_pic}
                      alt={member.user.first_name}
                    />
                    <AvatarFallback>
                      {member.user.first_name[0]}
                      {member.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{`${member.user.first_name} ${member.user.last_name}`}</span>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{member.user.phone_number}</TableCell>
              <TableCell>
                <Badge variant="outline">{member.role}</Badge>
              </TableCell>
              <TableCell>
                {new Date(member.joined_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {member.role !== TeamMemberRole.Admin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(member.user.id)}
                  >
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamMemberPage;
