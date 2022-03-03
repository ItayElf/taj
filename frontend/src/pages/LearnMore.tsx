import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";

export function LearnMore() {
  return (
    <>
      <Header />
      <div className="min-h-full-main container mx-auto space-y-6 pt-4">
        <h1 className="text-bold text-6xl">Taj - View Your Project Anytime</h1>
        <p className="text-2xl">
          Taj is a platform for developers to share their projects and get
          feedback from other developers. Taj shows projects tracked and pushed
          using the software "raja", an open source, source control software.
          The source code for Taj can be found{" "}
          <a href="https://github.com/ItayElf/taj" className="text-primary">
            here
          </a>
          .
        </p>
        <h2 className="text-4xl">Getting Started</h2>
        <p className="text-2xl">
          In order to start using Taj, you first need to register, which you can
          do{" "}
          <Link to={"/signUp"} className="text-primary">
            here
          </Link>
          . After you have an account, you need to install either the docker
          image for raja or (if you are using linux) the python code itself. You
          can install it by using the git:{" "}
          <code className="bg-secondary rounded p-1">
            {">"}git clone https://github.com/ItayElf/raja.git
          </code>{" "}
          or downloading manually from{" "}
          <a href="https://github.com/ItayElf/raja" className="text-primary">
            https://github.com/ItayElf/raja
          </a>
          .
        </p>
        <p className="text-2xl">
          Build the docker image using{" "}
          <code className="bg-secondary rounded p-1">
            {">"}docker build -t raja .
          </code>
        </p>
        <p className="text-2xl">
          In order to see all the functions, use{" "}
          <code className="bg-secondary rounded p-1">{">"}raja help</code>
        </p>
      </div>
      <Footer />
    </>
  );
}
