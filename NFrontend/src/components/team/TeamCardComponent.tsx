import { Users } from "lucide-react";
import { Link } from "react-router-dom";
interface Props {
  teamId: number;
  teamName: string;
  teamDescription: string;
}
const TeamCardComponents: React.FC<Props> = ({
  teamId,
  teamName,
  teamDescription,
}) => {
  return (
    <Link
      to={`/teams/${teamId}`}
      className="block group aspect-video rounded-xl bg-slate-100 hover:bg-muted/70 transition-colors"
    >
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex mt-5 items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
          <Users className="w-6 h-6 text-black group-hover:text-white transition-colors" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
          {teamName}
        </h3>
        <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-800 text-center">
          {teamDescription.slice(0, 100)}
          {teamDescription.length > 100 ? "..." : ""}
        </p>
      </div>
    </Link>
  );
};
export default TeamCardComponents;
