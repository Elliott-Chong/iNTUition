import React from "react";

import {
  LightModeOutlined,
  DarkModeOutlined,
  QuestionMark,
} from "@mui/icons-material";
import {
  AppBar,
  Button,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Dialog,
  useMediaQuery,
} from "@mui/material";
import FlexBetween from "./FlexBetween";
import { useGlobalContext } from "../context";
import useAuth from "../hooks/useAuth";
const Navbar = () => {
  const { setMode, getGoogleAuthURL } = useGlobalContext();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const theme = useTheme();
  const { user, isLoading } = useAuth(undefined);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (isLoading) return;
    if (localStorage.getItem("hasViewedIntro") === "true" && user) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [user, isLoading]);
  return (
    <>
      <AppBar
        sx={{
          position: "static",
          background: "none",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {!isMobile && (
            <FlexBetween gap={2}>
              <Typography variant="h3" fontWeight={"bold"}>
                Auto-Track
              </Typography>
              <IconButton
                onClick={() => {
                  localStorage.setItem("hasViewedIntro", "true");
                  setOpen(true);
                }}
              >
                <QuestionMark />
              </IconButton>
            </FlexBetween>
          )}

          {/* RIGHT SIDE */}
          <FlexBetween gap="1.5rem">
            {theme.palette.mode === "light" ? (
              <IconButton onClick={() => setMode("dark")}>
                <DarkModeOutlined sx={{ fontSize: "25px" }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => setMode("light")}>
                <LightModeOutlined sx={{ fontSize: "25px" }} />
              </IconButton>
            )}

            <FlexBetween>
              <Button
                // onClick={handleClick}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textTransform: "none",
                }}
              >
                <Box
                  component={"img"}
                  src={user?.profile_img}
                  referrerPolicy="no-referrer"
                  alt="profile"
                  height="32px"
                  width="32px"
                  borderRadius={"50%"}
                  sx={{ objectFit: "cover", mr: "1rem" }}
                />
                <Box textAlign="left">
                  <Typography
                    fontWeight={"bold"}
                    fontSize="0.85rem"
                    sx={{ color: theme.palette.secondary[100] }}
                  >
                    {user?.name}
                  </Typography>
                </Box>
              </Button>
              <Button
                sx={{
                  ml: 2,
                  fontSize: isMobile && "0.75rem",
                  whiteSpace: "nowrap",
                }}
                href={getGoogleAuthURL()}
                variant="contained"
              >
                Sync Account
              </Button>
              {/* <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              // anchorOrigin={{ vertical: "center", horizontal: "center" }}
            >
              <MenuItem onClick={handleClose}>Log out</MenuItem>
            </Menu> */}
              {user && (
                <Button
                  sx={{
                    ml: 2,
                    fontSize: isMobile && "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                  }}
                  variant="contained"
                >
                  Log out
                </Button>
              )}
            </FlexBetween>
          </FlexBetween>
        </Toolbar>
      </AppBar>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          localStorage.setItem("hasViewedIntro", "true");
        }}
      >
        <Box padding="2rem">
          <Typography fontWeight={"bold"} fontSize="1.5rem" mb="1rem">
            What does this app do?
          </Typography>
          <Typography>
            Most of our transactions nowadays are digitalised using PayLah! or
            PayNow. <br />
            <br /> In a age of automation, why should you have to manually track
            your expenses?
            <br />
            <br />
            This is a simple web app that scrapes your email and finds
            transaction alerts from your bank. It then automatically tracks them
            here.
          </Typography>
          <Button
            sx={{ marginTop: "1rem" }}
            href={getGoogleAuthURL()}
            variant="contained"
            onClick={() => {
              localStorage.setItem("hasViewedIntro", "true");
            }}
          >
            Sync Account
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default Navbar;
