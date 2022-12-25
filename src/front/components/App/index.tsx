import { ContextType } from "front";
import Utility from "./Utility";
import Router from "./Router";
import { Header } from "front/components";
import AppContext from "./AppContext";
import "./variables.css";
import "./index.css";

interface Props {
  initialUser: ContextType["user"];
}

const App = ({ initialUser }: Props) => {
  return (
    <AppContext initialUser={initialUser}>
      <Utility />
      <Router />
      <Header />
    </AppContext>
  );
};

export default App;
