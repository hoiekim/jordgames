import { Game, Room } from "back/lib";
import { useAppContext } from "./context";

export const useCombos = (room: Room | null | undefined): Game[][] => {
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

  const gamesSortedByVotes = gamesVotedMoreThanMinPlayers.sort((a, b) => {
    return b.votes.length - a.votes.length;
  });

  const combos: Game[][] = [];

  for (let i = 0; i < gamesSortedByVotes.length; i++) {
    for (let j = i + 1; j < gamesSortedByVotes.length; j++) {
      const gameA = gamesSortedByVotes[i];
      const gameB = gamesSortedByVotes[j];
      let anyNonPlayer = false;
      users.forEach((user) => {
        const allVotes = [...gameA.votes, ...gameB.votes];
        const found = allVotes.find((voter) => voter.id === user.id);
        if (!found) anyNonPlayer = true;
      });
      if (anyNonPlayer) continue;
      const gameDetailA = bggGameDetails.get(gameA.id);
      const gameDetailB = bggGameDetails.get(gameB.id);
      if (!gameDetailA || !gameDetailB) continue;
      const minPlayersA = +gameDetailA.minplayers.value;
      const maxPlayersA = +gameDetailA.maxplayers.value;
      const minPlayersB = +gameDetailB.minplayers.value;
      const maxPlayersB = +gameDetailB.maxplayers.value;
      if (users.size < minPlayersA + minPlayersB) continue;
      if (users.size > maxPlayersA + maxPlayersB) continue;
      combos.push([gameA, gameB]);
    }
  }

  return combos;
};
