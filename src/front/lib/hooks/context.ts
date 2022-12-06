import { createContext, useContext, Dispatch, SetStateAction } from "react";
import { Room, User } from "back/lib";
import { ClientRouter } from "front";

export type Rooms = Map<string, Room>;

export interface ContextType {
  rooms: Rooms;
  setRooms: Dispatch<SetStateAction<Rooms>>;
  user: User | undefined;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  router: ClientRouter;
}

export const Context = createContext<ContextType>({} as ContextType);

export const useAppContext = () => useContext(Context);
