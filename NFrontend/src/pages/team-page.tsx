import CreateTeamComponent from "@/components/team/CreateTeamComponent";
import TeamCardComponents from "@/components/team/TeamCardComponent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import teamService from "@/services/teamService";
import { Team } from "@/types/project";
import { CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TeamPage = () => {
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await teamService.getTeams();
        setTeams(response);
      } catch (err: any) {
        console.log(err);
        toast.error("Failed to fetch teams. Please try again.");
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-visible">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3 mt-2">
          <Dialog>
            {/* Trigger */}
            <DialogTrigger asChild>
              <a className="block group aspect-video rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
                    <CirclePlus className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
                    Create a New team
                  </h3>
                </div>
              </a>
            </DialogTrigger>
            <CreateTeamComponent></CreateTeamComponent>
          </Dialog>
          {teams?.map((team) => (
            <TeamCardComponents
              teamId={team.id}
              teamName={team.name}
              teamDescription={team.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
