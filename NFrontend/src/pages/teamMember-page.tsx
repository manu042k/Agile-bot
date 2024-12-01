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
import { Team } from "@/types/project";

const TeamMemberPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!teamId) return;
        const response = await teamService.getTeam(teamId);
        setTeam(response);
        console.log(response);
      } catch (err: any) {
        console.log(err);
      }
    };

    fetchTeam();
  }, [teamId]);

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
        <Button variant="default" size="lg">
          Add Member
        </Button>
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
            <TableRow>
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
                <Button
                  variant="destructive"
                  size="sm"
                  // onClick={() => onDeleteUser(member.user.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamMemberPage;
