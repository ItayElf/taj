import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import { apiUrl } from "../constants";
import { get } from "../utils/fetchUtils";
import { Commit, Repo, RepoFile } from "../utils/interfaces";
import { MdFolder, MdInsertDriveFile } from "react-icons/md";
import { timeSince, useTitle } from "../utils/funcs";

export default function RepoPage() {
  const [repoData, setRepoData] = useState<Repo | null | undefined>(null);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [lastCommit, setLastCommit] = useState<Commit | null>(null);
  const { repo } = useParams();

  useTitle("Taj - " + repo);

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
      const files = JSON.parse(await res2.text()) as RepoFile[];
      setRepoFiles(files);
      setLastCommit(
        files.reduce((p, c) =>
          p.commit.timestamp > c.commit.timestamp ? p : c
        ).commit
      );
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
          <div className="flex w-full flex-col px-5">
            <div className="flex justify-between">
              <button className="bg-secondary hover:bg-secondary/80 text-primary-dark block rounded py-2 px-4 text-center font-bold">
                COMMITNAME
              </button>
              {/* // TODO: add dropdown with commits */}
              <button className="bg-primary hover:bg-primary/80 block rounded py-2 px-4 text-center font-bold text-white">
                Code
              </button>
              {/* // TODO: add dropdown with download options */}
            </div>
            <div className="border-secondary mt-5 flex flex-col rounded border">
              <div className="bg-secondary flex flex-row justify-between px-4 py-2">
                <div className="flex flex-row items-center space-x-5">
                  <Link to={`/user/${lastCommit?.author}`}>
                    <img
                      src={`/user/${lastCommit?.author}/profile_pic`}
                      className="h-8 w-8 max-w-none rounded-full"
                      alt={`${lastCommit?.author}'s profile`}
                    />
                  </Link>
                  <Link
                    to={`/user/${lastCommit?.author}`}
                    className="font-bold"
                  >
                    {lastCommit?.author}
                  </Link>
                  <span>{lastCommit?.message}</span>
                </div>
                <span className="w-1/4 text-right">
                  {timeSince(lastCommit?.timestamp ?? new Date().getTime())} ago
                </span>
              </div>
              <div>
                {repoFiles
                  .filter((f) => f.type === "dir")
                  .map((f) => (
                    <div className="flex flex-row px-4 py-2">
                      <MdFolder className="text-primary text-2xl" />
                      <div className="flex w-full flex-row pl-2">
                        <Link to={"#"} className="w-1/3">
                          {f.name}
                        </Link>
                        <Link to={"#"} className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </Link>
                        <span className="w-1/4 text-right">
                          {timeSince(f.commit.timestamp)} ago
                        </span>
                      </div>
                    </div>
                  ))}
                {repoFiles
                  .filter((f) => f.type !== "dir")
                  .map((f) => (
                    <div className="flex flex-row px-4 py-2">
                      <MdInsertDriveFile className="text-primary text-2xl" />
                      <div className="flex w-full flex-row pl-2">
                        <Link to={"#"} className="w-1/3">
                          {f.name}
                        </Link>
                        <Link to={"#"} className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </Link>
                        <span className="w-1/4 text-right">
                          {timeSince(f.commit.timestamp)} ago
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
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
