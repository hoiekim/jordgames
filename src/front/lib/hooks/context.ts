import { createContext, useContext, Dispatch, SetStateAction } from "react";
import { Room, User } from "back/lib";
import { BggGame, BggGameDetail, ClientRouter } from "front";

export type Rooms = Map<string, Room>;
export type BggGameDetails = Map<string, BggGameDetail>;
export type BggCollections = Map<string, BggGame[]>;
export interface ViewSize {
  width: number;
  height: number;
}

export interface ContextType {
  rooms: Rooms;
  setRooms: Dispatch<SetStateAction<Rooms>>;
  bggGameDetails: BggGameDetails;
  setBggGameDetails: Dispatch<SetStateAction<BggGameDetails>>;
  bggCollections: BggCollections;
  setBggCollections: Dispatch<SetStateAction<BggCollections>>;
  user: User | undefined;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  router: ClientRouter;
  viewSize: ViewSize;
  setViewSize: Dispatch<SetStateAction<ViewSize>>;
}

export const Context = createContext<ContextType>({} as ContextType);

export const useAppContext = () => useContext(Context);
