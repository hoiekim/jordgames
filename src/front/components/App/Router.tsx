import { CSSProperties, useMemo } from "react";
import {
  useAppContext,
  LoginPage,
  RoomsPage,
  PATH,
  ConfigureRoomPage,
  RoomDetailPage,
  VoteResultPage,
} from "front";

const Router = () => {
  const { router, viewSize } = useAppContext();
  const { path, transition } = router;
  const { incomingPath, transitioning, direction } = transition;

  const classNames = ["Router"];
  if (transitioning && direction) classNames.push("transitioning", direction);

  const getPage = (path: string) => {
    if (path === PATH.LOGIN) return <LoginPage />;
    if (path === PATH.ROOMS) return <RoomsPage />;
    if (path === PATH.CONFIGURE_ROOM) return <ConfigureRoomPage />;
    if (path === PATH.ROOM) return <RoomDetailPage />;
    if (path === PATH.VOTE_RESULT) return <VoteResultPage />;
    return <div>Not Found</div>;
  };

  const currentPage = useMemo(() => getPage(path), [path]);
  const incomingPage = useMemo(() => getPage(incomingPath), [incomingPath]);

  const safeAreaInsetTop = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--safeAreaInsetTop");
  const safeAreaInsetBottom = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--safeAreaInsetBottom");

  const style: CSSProperties = {
    minHeight: `calc(${viewSize.height}px - ${safeAreaInsetTop} - ${safeAreaInsetBottom}`,
  };

  return (
    <div className={classNames.join(" ")}>
      <div className="previousPage" style={style}>
        {transitioning && direction === "backward" && incomingPage}
      </div>
      <div className="currentPage" style={style}>
        {currentPage}
      </div>
      <div className="nextPage" style={style}>
        {transitioning && direction === "forward" && incomingPage}
      </div>
    </div>
  );
};

export default Router;
