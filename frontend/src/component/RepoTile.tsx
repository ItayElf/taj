import { Link } from "react-router-dom";
import { Repo } from "../utils/interfaces";

interface Props {
  repo: Repo;
}

export default function RepoTile({ repo }: Props) {
  return (
    <div className="my-2 flex flex-col">
      <Link to="#" className="text-primary text-xl font-bold">
        {repo.name}
      </Link>
      <p>{repo.description}</p>
      <p className="mt-2 font-light ">
        Created by {repo.creator}, {repo.contributors.length} contributors.
      </p>
    </div>
  );
}
