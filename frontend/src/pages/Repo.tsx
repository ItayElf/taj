import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import { apiUrl } from "../constants";
import { get, post } from "../utils/fetchUtils";
import { Commit, Repo, RepoFile } from "../utils/interfaces";
import {
  MdAdd,
  MdClear,
  MdDone,
  MdFolder,
  MdInsertDriveFile,
  MdModeEdit,
} from "react-icons/md";
import { timeSince, useQuery, useSame, useTitle } from "../utils/funcs";
import { useAppSelector } from "../redux/hooks";
import JsFileDownloader from "js-file-downloader";

export default function RepoPage() {
  const [repoData, setRepoData] = useState<Repo | null | undefined>(null);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [lastCommit, setLastCommit] = useState<Commit | null>(null);
  const [editDesc, setEditDesc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { same } = useSame(repoData?.creator ?? "");
  const { repo } = useParams();
  const { username, token } = useAppSelector((state) => state.userData);
  const query = useQuery();
  const navigate = useNavigate();
  const directory = query.get("dir") ?? "";
  const commit = query.get("commit") ?? "";
  let dirArr = directory.split("/");
  dirArr.pop();
  dirArr = [repo ?? "", ...dirArr];
  const last = dirArr[dirArr.length - 1];
  dirArr.pop();

  useTitle("Taj - " + repo);

  useEffect(() => {
    async function checkRepo() {
      const res = await get(apiUrl + `repos/${repo}`, {
        repo,
      });
      try {
        const text = await res.text();
        setRepoData(JSON.parse(text));
        setLastCommit((JSON.parse(text) as Repo).commits[0]);
      } catch (e) {
        setRepoData(undefined);
        return;
      }
      console.log({ commit });
      const res2 = await get(apiUrl + `repos/${repo}/files`, {
        directory,
        commit,
      });
      const files = JSON.parse(await res2.text()) as RepoFile[];
      if (files.length === 0) {
        setRepoData(undefined);
        return;
      }
      setRepoFiles(files);
    }
    checkRepo();
  }, [repo, directory, commit]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await post(apiUrl + `repos/${repo}/edit`, {
      username,
      token,
      description: editDesc,
    });
    if (res.ok) {
      setEditDesc(null);
      setRepoData(JSON.parse(await res.text()));
      setError("");
    } else if (res.status === 403) {
      navigate("/signIn");
    } else {
      setError(await res.text());
    }
  };

  const addContributor = async () => {
    const user = prompt("Add user as contributor:");
    if (user === null || user === "") {
      return;
    }
    const res = await post(apiUrl + `repos/${repo}/edit`, {
      username,
      token,
      contributors: [...(repoData?.contributors ?? []), user],
    });
    if (res.ok) {
      setRepoData(JSON.parse(await res.text()));
    } else if (res.status === 403) {
      navigate("/signIn");
    } else {
      alert(await res.text());
    }
  };

  const removeContributor = async (c: string) => {
    const ans = window.confirm(
      `Are you sure you want to remove ${c} as a contributor from this repo?`
    );
    if (!ans || repoData === undefined || repoData === null) {
      return;
    }
    const res = await post(apiUrl + `repos/${repo}/edit`, {
      username,
      token,
      contributors: repoData.contributors.filter((con) => con !== c),
    });
    if (res.ok) {
      setRepoData(JSON.parse(await res.text()));
    } else if (res.status === 403) {
      navigate("/signIn");
    } else {
      alert(await res.text());
    }
  };

  const downloadRepo = async () => {
    new JsFileDownloader({
      url: apiUrl + `repos/${repo}.zip?commit=${commit}`,
    });
  };

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
  } else if (
    repoData === undefined ||
    (commit !== "" &&
      repoData.commits.map((c) => c.hash).indexOf(commit) === -1)
  ) {
    return (
      <div>
        <Header />
        <NotFound className="h-full-main" />
        <Footer />
      </div>
    );
  }
  console.log({ repoData });
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
              <select
                className="bg-secondary hover:bg-secondary/80 text-primary-dark block rounded py-2 pl-4 text-left font-bold"
                value={commit || lastCommit?.hash}
                onChange={(e) =>
                  navigate(
                    `/repo/${repo}?dir=${directory}&commit=${e.target.value}`
                  )
                }
              >
                {repoData.commits.map((c) => (
                  <option value={c.hash} key={c.hash}>
                    {c.message}
                  </option>
                ))}
              </select>
              <div className="flex text-3xl">
                {dirArr.map((d, i) => (
                  <div key={i}>
                    <Link
                      to={
                        i === 0
                          ? `/repo/${repo}?commit=${commit}`
                          : `/repo/${repo}?dir=${
                              dirArr.slice(1, i + 1).join("/") + "/"
                            }&commit=${commit}`
                      }
                      className="text-primary"
                    >
                      {d}
                    </Link>
                    <span>/</span>
                  </div>
                ))}
                <span>{last}</span>
              </div>
              <button
                onClick={downloadRepo}
                className="bg-primary hover:bg-primary/80 block rounded py-2 px-4 text-center font-bold text-white"
              >
                Download Repo
              </button>
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
                  {timeSince(
                    lastCommit?.timestamp ?? new Date().getTime() * 0.001
                  )}{" "}
                  ago
                </span>
              </div>
              <div>
                {repoFiles
                  .filter((f) => f.type === "dir")
                  .map((f) => (
                    <div
                      className="flex flex-row items-center px-4 py-2"
                      key={f.name}
                    >
                      <MdFolder className="text-primary text-4xl" />
                      <div className="flex w-full flex-row items-center pl-2 text-xl">
                        <Link
                          to={`/repo/${repo}/?dir=${
                            directory + f.name + "/"
                          }&commit=${commit}`}
                          className="w-1/3"
                        >
                          {f.name}
                        </Link>
                        {/* <Link to={"#"} className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </Link> */}
                        <span className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </span>
                        <span className="w-1/4 text-right">
                          {timeSince(f.commit.timestamp)} ago
                        </span>
                      </div>
                    </div>
                  ))}
                {repoFiles
                  .filter((f) => f.type === "file")
                  .map((f) => (
                    <div
                      className="flex flex-row items-center px-4 py-2"
                      key={f.name}
                    >
                      <MdInsertDriveFile className="text-primary text-4xl" />
                      <div className="flex w-full flex-row items-center pl-2 text-xl">
                        <Link
                          to={`/repo/${repo}/file?file=${
                            directory + f.name
                          }&commit=${commit}`}
                          className="w-1/3"
                        >
                          {f.name}
                        </Link>
                        {/* <Link to={"#"} className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </Link> */}
                        <span className="text-primary-dark/80 w-full">
                          {f.commit.message}
                        </span>
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
              <div className="flex justify-between">
                {editDesc === null ? (
                  <p className="overflow-hidden text-ellipsis">
                    {repoData.description}
                  </p>
                ) : (
                  <div className="w-full">
                    <form className="flex w-full" onSubmit={submit}>
                      <textarea
                        // type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="bg-secondary-light mr-2 w-full rounded"
                      />
                      <button>
                        <MdDone className="text-primary mr-4 text-xl" />
                      </button>
                    </form>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                )}
                {same && editDesc === null && (
                  <button
                    onClick={() => {
                      setEditDesc(repoData.description);
                    }}
                  >
                    <MdModeEdit className="text-primary mr-4 text-xl" />
                  </button>
                )}
              </div>
            </div>
            <div className="pt-4">
              <div className="flex justify-between">
                <h2 className="text-xl">
                  Contributors
                  <span className="bg-secondary ml-1 rounded-full p-1">
                    {repoData.contributors.length}
                  </span>
                </h2>
                {same && (
                  <button onClick={addContributor}>
                    <MdAdd className="text-primary mr-4 text-2xl" />
                  </button>
                )}
              </div>
              <div className="flex flex-row flex-wrap space-x-3">
                {repoData.contributors.map((c) => (
                  <div className="flex flex-col items-center" key={c}>
                    <Link to={`/user/${c}`}>
                      <div className="flex flex-col items-center">
                        <img
                          src={`/user/${c}/profile_pic`}
                          className="border-primary h-10 w-10 max-w-none rounded-full border-2"
                          alt={`${c}'s profile`}
                        />
                        <span>{c}</span>
                      </div>
                    </Link>
                    {c !== repoData.creator && (
                      <button onClick={() => removeContributor(c)}>
                        <MdClear className="top-0 text-red-500" />
                      </button>
                    )}
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
