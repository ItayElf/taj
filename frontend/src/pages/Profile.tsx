import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import RepoTile from "../component/RepoTile";
import { apiUrl } from "../constants";
import { useAppSelector } from "../redux/hooks";
import { get, post } from "../utils/fetchUtils";
import { Repo } from "../utils/interfaces";

export default function Profile() {
  const [found, setFound] = useState<boolean | null>(null);
  const [same, setSame] = useState(false);
  const [repo, setRepo] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const { username } = useParams();
  const { username: loggedUser, token } = useAppSelector(
    (state) => state.userData
  );

  useEffect(() => {
    async function checkUser() {
      const res = await get(apiUrl + "auth/user_exists", {
        username: username,
      });
      try {
        setFound(JSON.parse(await res.text()));
      } catch (e) {
        setFound(false);
        return;
      }
      if (loggedUser === username) {
        const res = await post(apiUrl + "auth/validate_token", {
          username,
          token,
        });
        const text = await res.text();
        setSame(JSON.parse(text));
      }
    }
    checkUser();
  }, [username, loggedUser, token]);

  useEffect(() => {
    async function getRepos() {
      if (found) {
        const res = await get(apiUrl + "repos/of/" + username, {});
        const text = await res.text();
        setRepos(JSON.parse(text) as Repo[]);
      }
    }
    getRepos();
  }, [found, username]);

  if (found === null) {
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
  } else if (!found) {
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
      <div className="min-h-full-main container mx-auto flex justify-center space-x-6 pt-8">
        <div className="flex w-80 flex-col space-y-2">
          <img
            src={`/user/${username}/profile_pic`}
            className="border-primary h-80 w-80 max-w-none rounded-full border-4"
            alt={`${username}'s profile`}
          />
          <h1 className="text-primary-dark/90 text-2xl">{username}</h1>
          {same ? (
            <Link
              to="#"
              className="bg-primary hover:bg-primary/80 block rounded py-2 px-4 text-center font-bold text-white"
            >
              Edit Profile
            </Link>
          ) : (
            <div></div>
          )}
        </div>
        <div className="divide-secondary flex w-full flex-col space-y-4 divide-y">
          <div className="flex flex-row space-x-4">
            <input
              type="text"
              value={repo}
              placeholder="Find a repository..."
              className="bg-secondary-light placeholder:text-primary-extra-dark/60 w-full rounded-md"
              onChange={(e) => setRepo(e.target.value)}
            />
            {same ? (
              <Link
                to="#"
                className="bg-primary hover:bg-primary/80 w-32 rounded py-2 px-4 text-center font-bold text-white"
              >
                New Repo
              </Link>
            ) : (
              <div></div>
            )}
          </div>
          <div>
            {!repos ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <h2 className="mt-12 text-center text-3xl">
                  {same ? "You don't" : `${username} doesn't`} have any
                  repositories yet!
                </h2>
                {same ? (
                  <Link
                    to="#"
                    className="bg-primary hover:bg-primary/80 w-32 rounded py-2 px-4 text-center font-bold text-white"
                  >
                    New Repo
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            ) : (
              <div className="divide-secondary flex flex-col divide-y">
                {repos.map((repo) => (
                  <RepoTile repo={repo} key={repo.name} />
                ))}
                <div></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
