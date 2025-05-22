import Link from "next/link";
import { FullSVGLogo } from "./brand/full-svg-logo";
import { ModeToggle } from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 bg-background/80 backdrop-blur-md border-b border-border/10">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl mx-auto">
        <FullSVGLogo />

        <nav className="flex flex-row gap-2 items-center justify-center text-muted-foreground">
          <span className="text-sm hidden md:block">Star us on</span>
          <Link
            href="https://github.com/jeanmeijer/analog"
            className="underline text-primary underline-offset-2 text-sm hover:text-primary/80 transition-colors"
            target="_blank"
          >
            Github
          </Link>

          <span className="text-sm hidden md:block">and follow on</span>
          <Link
            className="underline text-primary underline-offset-2 text-sm hover:text-primary/80 transition-colors"
            href="https://x.com/initjean"
            target="_blank"
          >
            X (Twitter)
          </Link>

          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
