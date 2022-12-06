import React from "react";
import ReactDOM from "react-dom/client";
import { LoginGetResponse } from "back/routes";
import { call } from "front";
import { App } from "front/components";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

call.get<LoginGetResponse>("/api/login").then((r) => {
  const app = r.data?.app;
  const version = app?.version;
  if (version) {
    const appInfoString = localStorage.getItem("app");
    const appInfo = appInfoString ? JSON.parse(appInfoString) : undefined;
    const theVersionThatIUsedToKnow = appInfo?.version;
    if (theVersionThatIUsedToKnow !== version) {
      localStorage.clear();
      localStorage.setItem("app", JSON.stringify(app));
    }
  }
  root.render(
    <React.StrictMode>
      <App initialUser={r.data?.user} />
    </React.StrictMode>
  );
});
