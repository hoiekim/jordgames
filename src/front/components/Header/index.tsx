import { MouseEventHandler, useState } from "react";
import { useAppContext, call, PATH } from "front";
import { MenuIcon, ChevronLeftIcon } from "front/components";
import "./index.css";

const Header = () => {
  const { user, setUser, router } = useAppContext();

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const { path, params, go, back } = router;

  const logout = () => {
    call.delete("/api/login");
    setUser(undefined);
    setIsHamburgerOpen(false);
    go(PATH.LOGIN);
  };

  const onClickBack: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    back();
  };

  const { LOGIN, ROOMS, CONFIGURE_ROOM, ROOM } = PATH;

  const isBackButtonDisabled =
    !params.toString() && !![LOGIN, ROOMS].find((e) => e === path);

  const backgroundUrl =
    path === ROOMS
      ? "all_rooms_header"
      : path === CONFIGURE_ROOM
      ? "config_page_header"
      : path === ROOM
      ? "vote_page_header"
      : "results_screen_header";

  return (
    <div className="Header" style={{ display: user ? undefined : "none" }}>
      <div className="viewController">
        <div className="backgroundColor" />
        <div
          className="backgroundImage"
          style={{
            backgroundImage: "url(/images/" + backgroundUrl + ".png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "681px 85px",
          }}
        />
        <div className="centerBox">
          <div className="backButton">
            {isBackButtonDisabled ? (
              <>&nbsp;</>
            ) : (
              <button
                className="icon"
                onClick={onClickBack}
                disabled={isBackButtonDisabled}
              >
                <ChevronLeftIcon />
              </button>
            )}
          </div>
          <div>{user?.username}</div>
          <div className="hamburger">
            <button className="icon" onClick={() => setIsHamburgerOpen((s) => !s)}>
              <MenuIcon />
            </button>
            {isHamburgerOpen && (
              <>
                <div className="fadeCover" onClick={() => setIsHamburgerOpen(false)} />
                <div className="menu" onMouseLeave={() => setIsHamburgerOpen(false)}>
                  <button disabled={!user} onClick={logout}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
