import { useState, ReactNode } from "react";
import { ContextType, Context, useRouter, Rooms } from "front";
import { User } from "back/lib";

interface Props {
  initialUser: ContextType["user"];
  children?: ReactNode;
}

const AppContext = ({ initialUser, children }: Props) => {
  const [rooms, setRooms] = useState<Rooms>(new Map());
  const [user, setUser] = useState<User | undefined>(initialUser);

  const router = useRouter();

  const contextValue: ContextType = {
    user,
    setUser,
    router,
    rooms,
    setRooms,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default AppContext;
