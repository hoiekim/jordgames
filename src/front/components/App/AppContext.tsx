import { useState, ReactNode } from "react";
import { ContextType, Context, useRouter, Rooms, useLocalStorage } from "front";
import { User } from "back/lib";
import { BggGameDetails } from "front/lib";

interface Props {
  initialUser: ContextType["user"];
  children?: ReactNode;
}

const AppContext = ({ initialUser, children }: Props) => {
  const [rooms, setRooms] = useState<Rooms>(new Map());
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [bggGameDetails, setBggGameDetails] = useLocalStorage<BggGameDetails>(
    "map_bggGameDetails",
    new Map()
  );

  const router = useRouter();

  const contextValue: ContextType = {
    user,
    setUser,
    router,
    rooms,
    setRooms,
    bggGameDetails,
    setBggGameDetails,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default AppContext;
