import { Link } from "react-router-dom";
import code from "./imgs/code.jpg";
import "./App.css";
import Header from "./component/Header";
import Footer from "./component/Footer";

function App() {
  return (
    <div>
      <Header />
      <div className="h-full-main w-full">
        <div className="grid h-full grid-cols-2 items-center">
          <main className="mx-auto mt-10 max-w-7xl px-4">
            <div>
              <h1 className="text-8xl font-extrabold tracking-tight">
                <span className="block ">Explore and share</span>
                <span className="text-primary block">programming project</span>
              </h1>
              <p className="text-primary-dark mx-0 mt-5 max-w-xl text-2xl">
                Taj is a platform for developers to share their projects and get
                feedback from other developers.
              </p>
              <div className="mt-8 flex justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/signUp"
                    className="bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-md border border-transparent py-4 px-10 text-xl font-medium text-white"
                  >
                    Get started
                  </Link>
                </div>

                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="#"
                    className="bg-primary-extra-light text-primary hover:bg-primary-extra-light/80 flex w-full items-center justify-center rounded-md border border-transparent py-4 px-10 text-xl font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </main>
          <img
            src={code}
            className="clip-path-slash h-full object-cover"
            alt=""
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
