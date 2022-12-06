import { Game, Room } from "back/lib";
import { BggGameDetail } from "front/lib";

export const getCombos = async (room: Room, retry = 0): Promise<Game[][] | null> => {
  if (retry > 5) return null;

  return new Promise((res) => {
    try {
      const { games } = room;

      const gameDetails = new Map(
        games.map((game) => {
          const key = "bggGameDetail_" + game.id;
          const item = window.localStorage.getItem(key);
          if (!item) throw new Error();
          const detail = JSON.parse(item) as BggGameDetail;
          return [game.id, detail];
        })
      );

      const users = games.flatMap(({ votes }) => votes);

      const gamesVotedMoreThanMinPlayers = games.filter(({ id, votes }) => {
        return votes.length >= +(gameDetails.get(id)?.minplayers?.value || 0);
      });

      const gamesSortedByVotes = gamesVotedMoreThanMinPlayers.sort((a, b) => {
        return b.votes.length - a.votes.length;
      });

      const combos: Game[][] = [];

      for (let i = 0; i < gamesSortedByVotes.length; i++) {
        for (let j = i + 1; j < gamesSortedByVotes.length; j++) {
          const first = gamesSortedByVotes[i];
          const second = gamesSortedByVotes[j];
          const anyNonPlayer = !!users.find((user) => {
            return ![...first.votes, ...second.votes].find(
              (voter) => voter.id === user.id
            );
          });
          if (anyNonPlayer) continue;
          combos.push([first, second]);
        }
      }

      res(combos);
    } catch (err) {
      setTimeout(async () => {
        const result = await getCombos(room, retry + 1);
        res(result);
      }, 1000);
    }
  });
};
