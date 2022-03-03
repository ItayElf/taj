import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import RepoTile from "../component/RepoTile";
import { apiUrl } from "../constants";
import { get } from "../utils/fetchUtils";
import { useQuery } from "../utils/funcs";
import { SearchReasults } from "../utils/interfaces";

export function Search() {
  const [results, setResults] = useState<SearchReasults | null>(null);
  const [repos, setRepos] = useState(false);
  const query = useQuery();
  const searchQuery = query.get("query") ?? "";

  useEffect(() => {
    async function getResults() {
      if (searchQuery !== null) {
        const res = await get(apiUrl + "search", { query: searchQuery });
        if (res.ok) {
          setResults(JSON.parse(await res.text()));
        } else {
          setResults({ repos: [], users: [] });
        }
      }
    }
    getResults();
  }, [searchQuery]);

  if (results === null) {
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
  }

  return (
    <div>
      <Header />
      <div className="min-h-full-main">
        <div className="mx-auto flex w-2/3 pt-10">
          <div className="border-secondary divide-secondary mr-2 h-min w-1/3 divide-y overflow-hidden rounded-md border">
            <button
              className={`${
                repos
                  ? "border-l-secondary-extra-dark border-l-4"
                  : "hover:bg-secondary/30"
              } block w-full px-2 py-4 text-3xl`}
              disabled={repos}
              onClick={() => setRepos(true)}
            >
              <div className="flex w-full justify-between pr-2">
                <span>Repositories</span>
                <span className="bg-secondary rounded-full p-1 text-2xl">
                  {results.repos.length}
                </span>
              </div>
            </button>
            <button
              className={`${
                !repos
                  ? "!border-l-secondary-extra-dark border-l-4"
                  : "hover:bg-secondary/30"
              } block w-full px-2 py-4 text-3xl`}
              disabled={!repos}
              onClick={() => setRepos(false)}
            >
              <div className="flex w-full justify-between pr-2">
                <span>Users</span>
                <span className="bg-secondary rounded-full p-1 text-2xl">
                  {results.users.length}
                </span>
              </div>
            </button>
          </div>
          <div className="divide-secondary ml-2 w-2/3 divide-y">
            <h2 className="text-3xl">
              {repos
                ? results.repos.length + " repositories results"
                : results.users.length + " users"}
            </h2>
            {repos
              ? results.repos.map((r) => <RepoTile repo={r} />)
              : results.users.map((c) => (
                  <div className="flex items-center space-x-2 p-4">
                    <img
                      src={`/user/${c}/profile_pic`}
                      className="border-primary h-10 w-10 max-w-none rounded-full border-2"
                      alt={`${c}'s profile`}
                    />
                    <Link className="text-primary text-2xl" to={`/user/${c}`}>
                      {c}
                    </Link>
                  </div>
                ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
