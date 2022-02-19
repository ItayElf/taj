import Logo from "./Logo";

interface Props {
  className?: string;
}

export default function NotFound({ className }: Props) {
  return (
    <div className={className + " flex flex-col items-center justify-center"}>
      <Logo className="h-36" />
      <h1 className="text-primary text-6xl">404 NOT FOUND</h1>
      <p className="text-3xl">The page you were looking for does not exists.</p>
    </div>
  );
}
