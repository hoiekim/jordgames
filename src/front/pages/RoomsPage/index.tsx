import { useSync } from "front/lib";
import RoomsTable from "./RoomsTable";
import "./index.css";

const RoomsPage = () => {
  const { sync } = useSync();
  return (
    <div className="RoomsPage">
      <h2>
        <span>All Rooms</span>
        <button onClick={sync.all}>Refresh</button>
      </h2>
      <RoomsTable />
    </div>
  );
};

export default RoomsPage;
