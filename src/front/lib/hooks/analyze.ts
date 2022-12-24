import { Game, Room } from "back/lib";
import { useAppContext } from "./context";

/**
 * Given a room, get combos that contains "n" number of games. Combos should
 * only contain games that are voted by at least the minimum number of players
 * determined by the room configuration and required to play that game. All
 * voters should be able to find at least one game that they voted in every
 * combo. The total number of voters should fit in the range of minimum and
 * maximum players of all games in the combo.
 * @param room Room class object
 * @param n number of games in a combo
 * @returns
 */
export const useCombos = (room: Room | null | undefined, n = 2): Game[][] => {
  const { bggGameDetails } = useAppContext();
  if (!room) return [];

  const { games, min_players: minPlayersForRoom } = room;

  const users = new Map(
    games.flatMap(({ votes }) => votes).map((user) => [user.id, user])
  );

  const gamesVotedMoreThanMinPlayers = games.filter(({ id, votes }) => {
    const minPlayersForGame = +(bggGameDetails.get(id)?.minplayers?.value || 0);
    const minPlayers = Math.max(minPlayersForRoom, minPlayersForGame);
    return votes.length >= minPlayers;
  });

  const combos = getSubsets(gamesVotedMoreThanMinPlayers, n);

  const combosSortedByNumberOfVoters = combos.sort((a, b) => {
    const sumOfVotersInA = a.reduce((acc, { votes }) => acc + votes.length, 0);
    const sumOfVotersInB = b.reduce((acc, { votes }) => acc + votes.length, 0);
    return sumOfVotersInB - sumOfVotersInA;
  });

  return combosSortedByNumberOfVoters.filter((combo) => {
    let anyNonPlayer = false;
    users.forEach((user) => {
      const allVotes = combo.flatMap(({ votes }) => votes);
      const found = allVotes.find((voter) => voter.id === user.id);
      if (!found) anyNonPlayer = true;
    });
    if (anyNonPlayer) return false;

    const details = combo.map(({ id }) => bggGameDetails.get(id));
    const [sumOfMin, sumOfMax] = details.reduce(
      (acc, detail) => {
        const [subSumOfMin, subSumOfMax] = acc;
        if (!detail) return acc;
        const min = +detail.minplayers.value;
        const max = +detail.maxplayers.value;
        return [subSumOfMin + min, subSumOfMax + max];
      },
      [0, 0]
    );
    if (users.size < sumOfMin || users.size > sumOfMax) return false;
    return true;
  });
};

export const getSubsets = <T>(array: T[], n: number) => {
  const result: T[][] = [];

  const pushSubsets = (array: T[], n: number, partial: T[] = []) => {
    array.forEach((e, i) => {
      if (n > 1) {
        const clone = array.slice();
        clone.splice(0, i + 1);
        pushSubsets(clone, n - 1, partial.concat([e]));
      } else result.push(partial.concat([e]));
    });
  };

  pushSubsets(array, n);

  return result;
};
