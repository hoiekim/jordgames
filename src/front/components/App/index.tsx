import { ContextType } from "front";
import Utility from "./Utility";
import Router from "./Router";
import { Header } from "front/components";
import AppContext from "./AppContext";
import "./index.css";

interface Props {
  initialUser: ContextType["user"];
}

const App = ({ initialUser }: Props) => {
  return (
    <AppContext initialUser={initialUser}>
      <Utility />
      <Header />
      <Router />
    </AppContext>
  );
};

export default App;
