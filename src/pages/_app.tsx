import { type AppType } from "next/app";

import { api } from "../utils/api";

import "../styles/globals.css";
import { AppProvider, useGlobalContext } from "../context";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { themeSettings } from "../theme";
import Layout from "../components/Layout";

const WrappedApp = ({ children }: { children: React.ReactNode }) => {
  const { mode } = useGlobalContext();
  return (
    <ThemeProvider theme={createTheme(themeSettings(mode))}>
      <CssBaseline />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
};

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AppProvider>
      <WrappedApp>
        <Component {...pageProps} />
      </WrappedApp>
    </AppProvider>
  );
};

export default api.withTRPC(MyApp);
