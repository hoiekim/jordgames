import { useEffect } from "react";
import { useAppContext, useSync, PATH } from "front";

let lastSync = new Date();

const Utility = () => {
  const { user, router, setViewSize } = useAppContext();
  const { path, go, transition } = router;
  const { transitioning } = transition;

  useEffect(() => {
    const { LOGIN } = PATH;
    if (!transitioning && !user && path !== LOGIN) go(LOGIN);
  }, [user, go, path, transitioning]);

  const { sync, clean } = useSync();

  const userLoggedIn = !!user;

  useEffect(() => {
    if (userLoggedIn) sync.all();
    else clean();
  }, [userLoggedIn, sync, clean]);

  useEffect(() => {
    const focusAction = (event: FocusEvent) => {
      const now = new Date();
      if (now.getTime() - lastSync.getTime() > 1000 * 60) {
        sync.all();
        lastSync = now;
      }
    };
    window.addEventListener("focus", focusAction);
    return () => window.removeEventListener("focus", focusAction);
  }, [sync]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setViewSize({ width: window.innerWidth, height: window.innerHeight });
    });
    window.addEventListener("orientationchange", () => {
      setViewSize({ width: window.innerWidth, height: window.innerHeight });
    });
  }, []);

  return <></>;
};

export default Utility;
