import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import RepoTile from "../component/RepoTile";
import { apiUrl } from "../constants";
import { useAppSelector } from "../redux/hooks";
import { get, post } from "../utils/fetchUtils";
import { blobToBase64, useSame, useTitle } from "../utils/funcs";
import { Repo } from "../utils/interfaces";

export default function Profile() {
  const [found, setFound] = useState<boolean | null>(null);
  const [repo, setRepo] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [shownRepos, setShownRepos] = useState<Repo[]>([]);
  const inputFile = useRef<HTMLInputElement>(null);
  const { username } = useParams();
  const { same } = useSame(username ?? "");
  const navigate = useNavigate();
  const { username: loggedUser, token } = useAppSelector(
    (state) => state.userData
  );

  useTitle("Taj - " + username);

  useEffect(() => {
    async function checkUser() {
      const res = await get(apiUrl + "auth/user_exists", {
        username,
      });
      try {
        setFound(JSON.parse(await res.text()));
      } catch (e) {
        setFound(false);
        return;
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
        setShownRepos(JSON.parse(text) as Repo[]);
      }
    }
    getRepos();
  }, [found, username]);

  const changeImage = async () => {
    if (inputFile.current === null) {
      return;
    }
    console.log(inputFile.current.files);
    if (inputFile.current.files == null) {
      return;
    }
    const text = inputFile.current.files[0];
    const fileBase64 = await blobToBase64(text);
    const res = await post(apiUrl + "auth/set_profile_pic", {
      username,
      token,
      file: fileBase64,
    });
    console.log(res.status);
    if (res.status === 403) {
      navigate("/signIn");
    } else {
      window.location.reload();
    }
  };

  const revoke = async () => {
    await post(apiUrl + "auth/revoke_token", { username, token });
    navigate("/signIn");
  };

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
            className="border-primary peer h-80 w-80 max-w-none rounded-full border-4"
            alt={`${username}'s profile`}
          />
          {same && (
            <button
              onClick={() => inputFile.current?.click()}
              className="absolute !mt-0 hidden h-80 w-80 items-center justify-center rounded-full bg-black/20 hover:flex peer-hover:flex"
            >
              Change image
              <input
                type="file"
                id="file"
                ref={inputFile}
                className="hidden"
                accept="image/*"
                onChange={changeImage}
              />
            </button>
          )}
          <h1 className="text-primary-dark/90 text-2xl">{username}</h1>
          {same && (
            <button
              onClick={revoke}
              className="bg-primary hover:bg-primary/80 block rounded py-2 px-4 text-center font-bold text-white"
            >
              Revoke Token
            </button>
          )}
        </div>
        <div className="divide-secondary flex w-full flex-col space-y-4 divide-y">
          <input
            type="text"
            value={repo}
            placeholder="Find a repository..."
            className="bg-secondary-light placeholder:text-primary-extra-dark/60 w-full rounded-md"
            onChange={(e) => {
              setRepo(e.target.value);
              setShownRepos(
                repos.filter((r) => r.name.startsWith(e.target.value))
              );
            }}
          />
          <div>
            {!repos ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <h2 className="mt-12 text-center text-3xl">
                  {same ? "You don't" : `${username} doesn't`} have any
                  repositories yet!
                </h2>
              </div>
            ) : (
              <div className="divide-secondary flex flex-col divide-y">
                {shownRepos.map((repo) => (
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
