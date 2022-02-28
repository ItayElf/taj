import { Link } from "react-router-dom";
import { Repo } from "../utils/interfaces";

interface Props {
  repo: Repo;
}

export default function RepoTile({ repo }: Props) {
  return (
    <div className="my-2 flex flex-col">
      <Link
        to={`/repo/${repo.name}`}
        className="text-primary text-xl font-bold"
      >
        {repo.name}
      </Link>
      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
        {repo.description}
      </p>
      <p className="mt-2 font-light ">
        Created by{" "}
        <Link to={`/user/${repo.creator}`} className="text-primary underline">
          {repo.creator}
        </Link>
        , {repo.contributors.length} contributors.
      </p>
    </div>
  );
}
