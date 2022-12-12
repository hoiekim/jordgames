import { CSSProperties } from "react";
import { Room } from "back/lib";
import { getColor, PATH, useAppContext } from "front";
import { EditIcon } from "front/components";

interface Props {
  room: Room;
}

const getStyle = (colorCode: number): CSSProperties => {
  const lightColorVar = `var(--${getColor(colorCode, 2)})`;
  const regularColorVar = `var(--${getColor(colorCode, 1)})`;
  return {
    backgroundColor: lightColorVar,
    boxShadow: `inset 5px 5px ${regularColorVar}, inset -5px -5px ${regularColorVar}`,
  };
};

const RoomRow = ({ room }: Props) => {
  const { router } = useAppContext();
  const { id, name, games } = room;

  const voters = new Set(games.flatMap(({ votes }) => votes.map(({ id }) => id)));

  const onClickEdit = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.CONFIGURE_ROOM, { params });
  };

  const onClickEnter = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.ROOM, { params });
  };

  const colorCode = parseInt(id, 16) % 4;

  return (
    <div className="RoomRow" style={getStyle(colorCode)}>
      <div className="roomInfo">
        <div className="title">{name || "Unnamed"}</div>
        <div className="info">
          <span>{games.length} games</span>
          {!!voters.size && <span>&nbsp;/ {voters.size} voters</span>}
        </div>
      </div>
      <div className="buttons">
        <div>
          <button className="icon" onClick={onClickEdit}>
            <EditIcon />
          </button>
        </div>
        <div>
          <button onClick={onClickEnter}>Enter</button>
        </div>
      </div>
    </div>
  );
};

export default RoomRow;
