import { Link } from "react-router-dom";

interface Props {
  username: string;
}

export default function Header({ username }: Props) {
  return (
    <nav className="bg-secondary-dark w-full">
      <div className="relative flex h-16 items-center justify-between px-8">
        <div className="flex flex-shrink-0 items-center space-x-8">
          {/* TODO: add logo */}
          <Link to="/" className="text-5xl font-bold">
            Taj
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="bg-secondary-dark hover:bg-secondary-semi-dark rounded-md px-3 py-2 text-lg font-medium"
            >
              Home
            </Link>
            <Link
              to="#"
              className="bg-secondary-dark hover:bg-secondary-semi-dark rounded-md px-3 py-2 text-lg font-medium"
            >
              Explore
            </Link>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center space-x-8">
          <div className="bg-secondary-semi-dark flex rounded-lg">
            <div className="flex items-center justify-center pl-1">
              <svg
                className="h-6 w-6 "
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search..."
              className=" placeholder-primary-dark bg-secondary-semi-dark w-60 rounded-lg border-none focus:ring-transparent"
            />
          </div>
          {!!username ? (
            <div></div>
          ) : (
            <div className="flex flex-shrink-0 space-x-6">
              <Link
                to="#"
                className="hover:bg-secondary-semi-dark rounded bg-transparent py-2 px-4 font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="#"
                className="bg-primary hover:bg-primary/80 rounded py-2 px-4 font-bold text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
