// Finishing training app. Holds the shared state (TrainingProvider) and shows the Employee ID
// screen, the left menu, the top bar and the page that matches the current route.
import { useEffect } from "react";
import { TrainingProvider, useTraining } from "../utils/TrainingContext";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import LoginGate from "../components/LoginGate";
import { Lightbox } from "../components/Pictures";
import { Button } from "../components/Ui";
import HomePage from "./HomePage";
import ModulePage from "./ModulePage";
import VideosPage from "./VideosPage";
import FinalPage from "./FinalPage";
import PassportPage from "./PassportPage";
import CertificatePage from "./CertificatePage";
import AdminPage from "./AdminPage";
import SetupCheck from "../components/SetupCheck";

const PAGES = {
  home: HomePage,
  module: ModulePage,
  videos: VideosPage,
  final: FinalPage,
  passport: PassportPage,
  certificate: CertificatePage,
  admin: AdminPage,
};

// Short message at the bottom of the screen, gone after about three seconds
function Toast() {
  const { t, actions } = useTraining();
  const toast = t.toast;
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(actions.clearToast, 3500);
    return () => clearTimeout(id);
  }, [toast]);
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-5 left-1/2 z-[90] max-w-[90vw] -translate-x-1/2 rounded-lg bg-black px-[18px] py-2.5 font-semibold text-yellow">
      {toast.message}
    </div>
  );
}

function Screen() {
  const { t, actions } = useTraining();
  const route = t.route;
  // Staff-only pages fall back to Home for everyone else
  const Page = route.name === "admin" && !t.role ? HomePage : PAGES[route.name] || HomePage;

  // Theme and text size are read from attributes on the page root (see index.css)
  useEffect(() => {
    const root = document.documentElement;
    if (t.theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-size", t.size);
  }, [t.theme, t.size]);

  // New page: scroll to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name, route.id, route.lesson]);

  if (!t.login) return <LoginGate />;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg font-body text-base leading-[1.55] text-ink desk:grid-cols-[18.75rem_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1400px] px-[clamp(16px,4vw,48px)] pb-[60px] pt-[26px]">
          {t.loading && <p className="mb-4 rounded-lg border border-line bg-surface px-4 py-3 text-muted">Loading your training…</p>}
          {t.loadError && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border-l-8 border-red bg-redBg px-4 py-3">
              <span>Problem with the server: {t.loadError}. You can read the course, but some things may not be saved.</span>
              <Button size="sm" onClick={() => actions.bootstrap(t.login)}>Try again</Button>
              <SetupCheck />
            </div>
          )}
          <Page />
        </main>
      </div>
      <Lightbox />
      <Toast />
    </div>
  );
}

export default function FinishingTraining() {
  return (
    <TrainingProvider>
      <Screen />
    </TrainingProvider>
  );
}