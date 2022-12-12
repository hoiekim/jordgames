import { MouseEventHandler, useState } from "react";
import { useAppContext, call, PATH } from "front";
import "./index.css";
import MenuIcon from "../MenuIcon";

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

  const { LOGIN, ROOMS } = PATH;

  const isBackButtonDisabled =
    !params.toString() && !![LOGIN, ROOMS].find((e) => e === path);

  return (
    <div className="Header" style={{ display: user ? undefined : "none" }}>
      <div className="viewController">
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
                ←
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
