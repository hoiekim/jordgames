import { useMemo } from "react";
import {
  useAppContext,
  LoginPage,
  RoomsPage,
  PATH,
  ConfigureRoomPage,
  RoomDetailPage,
} from "front";

const Router = () => {
  const { router } = useAppContext();
  const { path, transition } = router;
  const { incomingPath, transitioning, direction } = transition;

  const classNames = ["Router"];
  if (transitioning && direction) classNames.push("transitioning", direction);

  const getPage = (path: string) => {
    if (path === PATH.LOGIN) return <LoginPage />;
    if (path === PATH.ROOMS) return <RoomsPage />;
    if (path === PATH.CONFIGURE_ROOM) return <ConfigureRoomPage />;
    if (path === PATH.ROOM) return <RoomDetailPage />;
    return <div>Not Found</div>;
  };

  const currentPage = useMemo(() => getPage(path), [path]);
  const incomingPage = useMemo(() => getPage(incomingPath), [incomingPath]);

  return (
    <div className={classNames.join(" ")}>
      <div className="previousPage">
        {transitioning && direction === "backward" && incomingPage}
      </div>
      <div className="currentPage">{currentPage}</div>
      <div className="nextPage">
        {transitioning && direction === "forward" && incomingPage}
      </div>
    </div>
  );
};

export default Router;
