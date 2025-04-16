import { Button } from "../components/ui/button";
import { ProdPushLogo } from "../components/prodpush-logo";
import { RegisterButton, LoginButton } from "./LoginButton";

export function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b w-full">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <ProdPushLogo className="h-8 w-8" />
            <span className="text-xl font-bold">ProdPush</span>
          </div>
          <div className="flex items-center gap-2">
            <RegisterButton>Get Started</RegisterButton>
            <LoginButton>Login</LoginButton>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Boost your productivity
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ProdPush helps you organize your tasks and stay on top of
                    deadlines with a simple, intuitive interface.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <RegisterButton>Get Started</RegisterButton>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#features">Learn More</a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/Productivity.png"
                  alt="Productivity Image"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple features for maximum productivity
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ProdPush comes with everything you need to manage your tasks
                  effectively.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary p-2 text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 13 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Task Management</h3>
                <p className="text-center text-muted-foreground">
                  Create, organize, and track tasks with ease.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary p-2 text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Project Planning</h3>
                <p className="text-center text-muted-foreground">
                  Plan and visualize your projects from start to finish.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <ProdPushLogo className="h-6 w-6" />
            <p className="text-sm text-muted-foreground">
              © 2025 ProdPush. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
