import React from "react";
import querystring from "querystring";

function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `https://intuition-auto-track.vercel.app/api/auth/google/redirect`,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ].join(" "),
  };
  return `${rootUrl}?${querystring.stringify(options)}`;
}

interface IAppContext {
  mode: "dark" | "light";
  setMode: React.Dispatch<React.SetStateAction<string>> | null;
  getGoogleAuthURL: () => string;
}

const AppContext = React.createContext<IAppContext>({
  mode: "dark",
  setMode: null,
  getGoogleAuthURL: () => "",
});

export const AppProvider = ({ children }) => {
  const [mode, setMode] = React.useState<"dark" | "light">("dark");

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        getGoogleAuthURL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return React.useContext(AppContext);
};
