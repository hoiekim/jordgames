import { Game, Room, User } from "back/lib";
import { BggGameDetail } from "front/lib";

export class RecommendedGame extends Game {
  players: User[];
  unHappyPlayers: User[];

  constructor(game: Game, players: User[]) {
    super(game);
    this.players = players;
    this.unHappyPlayers = players.filter((user) => {
      return !this.votes.find((voter) => voter.id === user.id);
    });
  }
}

export const getRecommendations = async (
  room: Room,
  retry = 0
): Promise<RecommendedGame[] | null> => {
  if (retry > 5) return null;

  return new Promise((res) => {
    try {
      const { games } = room;

      const gameDetails = new Map(
        games.map((game) => {
          const key = "bggGameDetail_" + game.id;
          const item = window.localStorage.getItem(key);
          if (!item) throw new Error();
          const detail = JSON.parse(item);
          const detailedGame: Game & { detail: BggGameDetail } = { ...game, detail };
          return [game.id, detailedGame];
        })
      );

      const gamesVotedMoreThanMinPlayers = games.filter(({ id, votes }) => {
        return votes.length > +(gameDetails.get(id)?.detail?.minplayers || 0);
      });

      const gamesSortedByVotes = gamesVotedMoreThanMinPlayers.sort((a, b) => {
        return b.votes.length - a.votes.length;
      });

      const users = new Map(
        games.flatMap(({ votes }) => votes.map((user) => [user.id, user]))
      );

      const combos = new Map<string, RecommendedGame[]>();

      for (let i = 0; i < gamesSortedByVotes.length; i++) {
        for (let j = 0; j < gamesSortedByVotes.length; j++) {}
      }

      res([{} as RecommendedGame]);
    } catch (err) {
      setTimeout(async () => {
        const result = await getRecommendations(room, retry + 1);
        res(result);
      }, 1000);
    }
  });
};
