import { useSync } from "front/lib";
import RoomsTable from "./RoomsTable";
import "./index.css";
import { RefreshIcon } from "front/components";

const RoomsPage = () => {
  const { sync } = useSync();
  return (
    <div className="RoomsPage">
      <h2>
        <span>All Rooms</span>
        <button className="icon" onClick={sync.all}>
          <RefreshIcon />
        </button>
      </h2>
      <RoomsTable />
    </div>
  );
};

export default RoomsPage;
