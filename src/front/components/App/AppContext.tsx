import { useState, ReactNode } from "react";
import { ContextType, Context, useRouter, Rooms, useLocalStorage } from "front";
import { User } from "back/lib";
import { BggCollections, BggGameDetails } from "front/lib";

interface Props {
  initialUser: ContextType["user"];
  children?: ReactNode;
}

const AppContext = ({ initialUser, children }: Props) => {
  const [rooms, setRooms] = useState<Rooms>(new Map());
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [bggCollections, setBggCollections] = useState<BggCollections>(new Map());
  const [bggGameDetails, setBggGameDetails] = useLocalStorage<BggGameDetails>(
    "map_bggGameDetails",
    new Map()
  );
  const [viewSize, setViewSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const router = useRouter();

  const contextValue: ContextType = {
    user,
    setUser,
    router,
    rooms,
    setRooms,
    bggCollections,
    setBggCollections,
    bggGameDetails,
    setBggGameDetails,
    viewSize,
    setViewSize,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default AppContext;
