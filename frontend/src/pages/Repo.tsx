import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import { apiUrl } from "../constants";
import { get } from "../utils/fetchUtils";
import { Repo, RepoFile } from "../utils/interfaces";

export default function RepoPage() {
  const [repoData, setRepoData] = useState<Repo | null | undefined>(null);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const { repo } = useParams();

  useEffect(() => {
    async function checkRepo() {
      const res = await get(apiUrl + `repos/${repo}`, {
        repo,
      });
      try {
        setRepoData(JSON.parse(await res.text()));
      } catch (e) {
        setRepoData(undefined);
        return;
      }
      const res2 = await get(apiUrl + `repos/${repo}/files`, {});
      setRepoFiles(JSON.parse(await res2.text()) as RepoFile[]);
    }
    checkRepo();
  }, [repo]);

  if (repoData === null) {
    return (
      <div>
        <Header />
        <div className="h-full-main flex items-center justify-center">
          <div>
            <div className="border-primary h-24 w-24 animate-spin rounded-full border-8 border-solid [border-top-color:transparent]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } else if (!repoData) {
    return (
      <div>
        <Header />
        <NotFound className="h-full-main" />
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-full-main px-20 pt-10">
        <div className="divide-secondary flex divide-x-2">
          <div className="max-w-1/3 pr-4 text-3xl">
            <Link to={`/user/${repoData.creator}`} className="text-primary">
              {repoData.creator}
            </Link>
            <span>/</span>
            <Link to={`/repo/${repo}`} className="text-primary">
              {repo}
            </Link>
          </div>
          <div className="w-full"></div>
          <div className="divide-secondary flex w-1/3 flex-col divide-y-2 pl-4">
            <div className="pb-4">
              <h2 className="text-xl">About</h2>
              <p>{repoData.description}</p>
            </div>
            <div className="pt-4">
              <h2 className="text-xl">
                Contributors
                <span className="bg-secondary ml-1 rounded-full p-1">
                  {repoData.contributors.length}
                </span>
              </h2>
              <div className="flex flex-row flex-wrap space-x-3">
                {repoData.contributors.map((c) => (
                  <div className="flex flex-col items-center">
                    <img
                      src={`/user/${c}/profile_pic`}
                      className="border-primary h-10 w-10 max-w-none rounded-full border-2"
                      alt={`${c}'s profile`}
                    />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
