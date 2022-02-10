import code from "../imgs/code.jpg";

export default function Home() {
  return (
    <div className="flex items-center justify-between">
      <main className="mx-auto mt-10 max-w-7xl px-4 ">
        <div>
          <h1 className="text-6xl font-extrabold tracking-tight">
            <span className="block ">Explore and share</span>
            <span className="text-primary block">programming project</span>
          </h1>
          <p className="text-primary-dark mx-0 mt-5 max-w-xl text-xl">
            Taj is a platform where developers can share their projects and get
            feedback from other developers.
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <div className="rounded-md shadow">
              <a
                href="#"
                className="bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-md border border-transparent py-4 px-10 text-lg font-medium text-white"
              >
                Get started
              </a>
            </div>

            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="#"
                className="bg-primary-extra-light text-primary hover:bg-primary-extra-light/80 flex w-full items-center justify-center rounded-md border border-transparent py-4 px-10 text-lg font-medium"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </main>
      <img src={code} className="clip-path-slash object-cover" />
    </div>
  );
}
