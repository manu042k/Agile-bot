"use client";
import React, { useEffect, useState } from "react";
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

const TeamMemberPage = ({ params }: { params: { teamId: string } }) => {
  const teamId = params.teamId;
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
      setUsers(response);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchUsers();
  }, [teamId]);

  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Please select a user and a role.");
      return;
    }

    try {
      if (!teamId) return;
      // Find the user email from the selected user ID
      const selectedUserObj = users?.find(u => u.id === selectedUser);
      if (!selectedUserObj) {
        toast.error("User not found");
        return;
      }
      await teamService.addMember(parseInt(teamId), {
        user_email: selectedUserObj.email,
        role: selectedRole,
      });
      toast.success("Member added successfully!");
      setIsDialogOpen(false);
      fetchTeam(); // Refresh team data
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add member. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!teamId) return;
      await teamService.removeMember(parseInt(teamId), memberId);
      toast.success("Member removed successfully!");
      fetchTeam(); // Refresh team data
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove member. Please try again.");
    }
  };

  const handleUpdateRole = async (memberId: string, role: TeamMemberRole) => {
    try {
      if (!teamId) return;
      await teamService.updateTeamMemberRole(parseInt(teamId), memberId, role);
      toast.success("Role updated successfully!");
      fetchTeam(); // Refresh team data
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update role. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {team && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-500">{team.description}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Add New Member</h2>
                  <div className="grid gap-4">
                    <Select onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) =>
                        setSelectedRole(value as TeamMemberRole)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamMemberRole.Admin}>
                          Admin
                        </SelectItem>
                        <SelectItem value={TeamMemberRole.Member}>
                          Member
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddMember}>Add Member</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage src={member.user.profile_pic} />
                        <AvatarFallback>
                          {member.user.first_name[0]}
                          {member.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-bold">
                          {member.user.first_name} {member.user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleUpdateRole(member.id, value as TeamMemberRole)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamMemberRole.Admin}>
                          Admin
                        </SelectItem>
                        <SelectItem value={TeamMemberRole.Member}>
                          Member
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default TeamMemberPage;
