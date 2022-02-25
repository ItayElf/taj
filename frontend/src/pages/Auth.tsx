import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Logo from "../component/Logo";
import { apiUrl } from "../constants";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { post } from "../utils/fetchUtils";
import {
  setUsername as setUsernameAction,
  setToken as setTokenAction,
} from "../redux/userData";
import { useTitle } from "../utils/funcs";

interface Props {
  signIn: boolean;
}

export default function Auth({ signIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [logged, setLogged] = useState(false);
  const { username: loggedUser, token } = useAppSelector(
    (state) => state.userData
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useTitle("Taj - " + (signIn ? "Sign In" : "Sign Up"));

  useEffect(() => {
    if (!loggedUser || !token) {
      return;
    }
    (async () => {
      const res = await post(apiUrl + "auth/validate_token", {
        username: loggedUser,
        token,
      });
      setLogged(JSON.parse(await res.text()));
    })();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (signIn) {
      const res = await post(apiUrl + "auth/login", { username, password });
      const text = JSON.parse(await res.text());
      if (!text) {
        setError("Username or password are not correct.");
        return;
      }
      dispatch(setUsernameAction(username));
      dispatch(setTokenAction(text));
    } else {
      const res = await post(apiUrl + "auth/register", { username, password });
      const text = await res.text();
      if (res.status !== 200) {
        setError(text);
        return;
      }
      dispatch(setUsernameAction(username));
      dispatch(setTokenAction(text));
    }
    navigate(`/user/${username}`);
  };

  if (logged) {
    return <Navigate to={`/user/${loggedUser}`} />;
  }

  return (
    <div className="flex justify-center p-5">
      <div className="flex flex-col items-center justify-center">
        <div className="bg-secondary-dark relative rounded-full p-16">
          <Logo height={60} className="absolute top-8 left-5" />
        </div>
        <h1 className="py-4 text-3xl">
          {signIn ? "Sign in" : "Sign up"} to Taj
        </h1>
        <form
          onSubmit={submit}
          className="bg-secondary-dark mb-2 flex w-80 flex-col rounded p-6 shadow-sm"
        >
          <label htmlFor="useranme">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            className="mb-4 rounded-md"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="mb-4 rounded-md"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          {!!error ? (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          ) : (
            <div></div>
          )}
          <div className="w-full rounded-md bg-white">
            <button className="bg-primary hover:bg-primary/80 block w-full rounded-md p-2 text-white">
              {signIn ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>
        <div className="border-secondary-dark flex w-80 items-center justify-center space-x-1 rounded-md border-2 p-4">
          <span>{signIn ? "New to Taj? " : "Already have an account? "}</span>
          <Link className="text-primary" to={signIn ? "/signUp" : "/signIn"}>
            Click Here.
          </Link>
        </div>
      </div>
    </div>
  );
}
