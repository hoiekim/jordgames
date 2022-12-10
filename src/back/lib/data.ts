import { Stream } from "back/lib";

export const getRandomId = () =>
  (65536 + Math.floor(Math.random() * 983040)).toString(16);

export class Game {
  readonly id = getRandomId();
  readonly name: string = "";
  votes: User[] = [];

  constructor(init?: Partial<Game>) {
    if (init) Object.assign(this, init);
  }
}

export class Room {
  readonly id = getRandomId();
  name = "";
  games: Game[] = [];
  subscribers: Map<string, Subscriber> = new Map();
  readonly created: Date;

  constructor(init?: Partial<Room>) {
    if (init) Object.assign(this, init);
    this.created = new Date();
  }
}

export type JsonableRoom = ReturnType<typeof getJsonableRoom>;

export const getJsonableRoom = (room: Room) => {
  return { ...room, subscribers: Array.from(room.subscribers.values()) };
};

export const rooms = new Map<string, Room>();

export const getJsonableRooms = (): JsonableRoom[] => {
  return Array.from(rooms.values()).map(getJsonableRoom);
};

export class User {
  readonly id = getRandomId();
  readonly username: string = "";

  constructor(init?: Partial<User>) {
    if (init) Object.assign(this, init);
  }
}

export class Subscriber extends User {
  readonly room_id: string;
  readonly stream: Stream<any>;
  readonly created: Date;
  updated: Date;
  token?: string;

  constructor(user: User, room_id: string, stream: Stream<any>) {
    super(user);
    this.room_id = room_id;
    this.stream = stream;
    this.created = new Date();
    this.updated = new Date();
  }
}

const isDateOlderThan = (date: Date, limit: number) => {
  return new Date().getTime() - date.getTime() > limit;
};

const cleanScheduler = () => {
  rooms.forEach((room, room_id) => {
    const { subscribers } = room;

    if (isDateOlderThan(room.created, 1000 * 60 * 60 * 18)) {
      rooms.delete(room_id);
      subscribers.forEach(({ stream }) => {
        stream({ status: "streaming", data: { rooms: getJsonableRooms() } });
      });
      return;
    }

    subscribers.forEach(({ created, updated }, subscriber_id) => {
      if (!isDateOlderThan(created, 10007)) return;
      if (isDateOlderThan(updated, 5003)) {
        subscribers.delete(subscriber_id);
        subscribers.forEach(({ stream }) => {
          stream({ status: "streaming", data: { room: getJsonableRoom(room) } });
        });
      }
    });
  });

  setTimeout(cleanScheduler, 1201);
};

cleanScheduler();
