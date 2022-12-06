import { Game, Room, User } from "back/lib";
import { BggGame } from "front/lib";

export interface RecommendedGame extends Game {
  detail: BggGame;
  players: User[];
  unHappyPlayers: User[];
}

export const getRecommendations = (room: Room): RecommendedGame[] => {
  const { games } = room;
  const users = new Map(
    games.flatMap(({ votes }) => votes.map((user) => [user.id, user]))
  );
  const gamesWithAtLeastOneVote = games.filter(({ votes }) => votes.length);

  return [{} as RecommendedGame];
};
