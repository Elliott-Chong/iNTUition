import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PayLahImg from "../../public/paylah.png";
import PayNowImg from "../../public/paynow.png";
import { ResponsiveLine } from "@nivo/line";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import dayjs, { Dayjs } from "dayjs";
import AccordionSummary from "@mui/material/AccordionSummary";
import React from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAuth from "../hooks/useAuth";
import { Box, Stack } from "@mui/system";
import { Add } from "@mui/icons-material";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { api } from "../utils/api";

const Home: NextPage = () => {
  const utils = api.useContext();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { mutate, isLoading: isAdding } = api.user.addTransaction.useMutation({
    onSuccess: () => {
      utils.user.invalidate().catch((err) => console.log(err));
      setDialogOpen(false);
    },
  });
  const [dateValue, setDateValue] = React.useState<Dayjs>(dayjs(new Date()));
  const [amount, setAmount] = React.useState("");
  const [to, setTo] = React.useState("");
  const handleDateChange = (newValue) => {
    setDateValue(newValue);
  };
  const { isLoading, user } = useAuth(undefined);
  const theme = useTheme();
  const [transactions, setTransactions] = React.useState([]);

  React.useEffect(() => {
    if (!user || !user.transactions) return;
    // group by date
    const transactions = user.transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp).toDateString();
      if (acc[date]) {
        acc[date].push(transaction);
      } else {
        acc[date] = [transaction];
      }
      return acc;
    }, {});
    // sort
    Object.keys(transactions).forEach((date) => {
      transactions[date].sort((b, a) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    });
    // sort the object by dates
    const sortedTransactions = Object.keys(transactions)

      .sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      })
      .reduce((acc, date) => {
        acc[date] = transactions[date];
        return acc;
      }, {});

    setTransactions(sortedTransactions);
  }, [user]);

  const formattedData = React.useMemo(() => {
    if (!user || !user.transactions) return [];
    const data = user.transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp).toDateString();
      if (acc[date]) {
        acc[date] += transaction.amount;
      } else {
        acc[date] = transaction.amount;
      }
      return acc;
    }, {});
    const temp = Object.keys(data).map((date) => {
      return {
        x: date,
        y: data[date],
      };
    });
    return [{ id: "balance", data: temp, color: theme.palette.secondary[200] }];
  }, [user]);

  if (isLoading) return <Typography>Loading...</Typography>;
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div style={{ paddingInline: "1.5rem" }}>
        {Object.keys(transactions).map((date, idx) => {
          return (
            <>
              <Accordion sx={{ backgroundColor: theme.palette.background.alt }}>
                <AccordionSummary
                  key={idx}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${date}a-content`}
                  id={`panel${date}a-header`}
                >
                  <Typography fontWeight={"bold"} fontSize="1rem">
                    {date}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {transactions[date].map((transaction, idx) => {
                      return (
                        <>
                          <ListItem key={idx}>
                            {transaction.type === "PayLah!" ? (
                              <Image
                                src={PayLahImg}
                                style={{ height: "60px", width: "60px" }}
                                alt="paylah"
                              />
                            ) : transaction.type === "PayNow" ? (
                              <Image
                                src={PayNowImg}
                                style={{ height: "40px", width: "60px" }}
                                alt="paynow"
                              />
                            ) : (
                              <Avatar />
                            )}
                            <ListItemText
                              sx={{
                                marginLeft: "1rem",
                                "	.MuiListItemText-primary": {
                                  // color:
                                  //   parseFloat(transaction.amount) < 0
                                  //     ? "red"
                                  //     : "green",
                                  fontSize: "1rem",
                                  fontWeight: "bold",
                                },
                              }}
                              primary={
                                parseFloat(transaction.amount) < 0
                                  ? parseFloat(transaction.amount).toFixed(2)
                                  : `+${parseFloat(transaction.amount).toFixed(
                                      2
                                    )}`
                              }
                              secondary={transaction.to}
                            />
                          </ListItem>
                        </>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            </>
          );
        })}
      </div>
      {user ? (
        <>
          <Button
            onClick={() => setDialogOpen(true)}
            variant="contained"
            sx={{
              position: "relative",
              left: "50%",
              transform: "translateX(-50%)",
              mt: "1rem",
            }}
          >
            <Add />
            <Typography>New Transaction</Typography>
          </Button>
          <Box width="90vw" height="600px" padding="0 0 10rem">
            <ResponsiveLine
              // data={[]}
              data={formattedData || []}
              theme={{
                axis: {
                  domain: {
                    line: {
                      stroke: theme.palette.secondary[200],
                    },
                  },
                  legend: {
                    text: {
                      fill: theme.palette.secondary[200],
                    },
                  },
                  ticks: {
                    line: {
                      stroke: theme.palette.secondary[200],
                      strokeWidth: 1,
                    },
                    text: {
                      fill: theme.palette.secondary[200],
                    },
                  },
                },
                legends: {
                  text: {
                    fill: theme.palette.secondary[200],
                  },
                },
                tooltip: {
                  container: {
                    color: theme.palette.primary.main,
                  },
                },
              }}
              colors={{ datum: "color" }}
              margin={{ top: 50, right: 50, bottom: 80, left: 100 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              yFormat=" >-.2f"
              // curve="catmullRom"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                orient: "bottom",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 30,
                legend: "Month",
                legendOffset: 70,
                legendPosition: "middle",
              }}
              axisLeft={{
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Total",
                legendOffset: -50,
                legendPosition: "middle",
              }}
              enableGridX={false}
              enableGridY={false}
              pointSize={10}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: "top-right",
                  direction: "column",
                  justify: false,
                  translateX: 50,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemBackground: "rgba(0, 0, 0, .03)",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </Box>
        </>
      ) : (
        <Typography fontSize="1rem" fontWeight={"bold"} textAlign="center">
          Please sync your account first!
        </Typography>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <Box padding="1.5rem">
          <DialogTitle>Add new transaction</DialogTitle>
          <Stack gap={2}>
            <TextField
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              label="Amount"
              variant="outlined"
              type="number"
            />
            <TextField
              value={to}
              onChange={(e) => setTo(e.target.value)}
              label="Recipient"
              variant="outlined"
              type="text"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDatePicker
                label="Date"
                inputFormat="YYYY-MM-DD"
                value={dateValue}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            <Button
              disabled={isAdding}
              onClick={(e) => {
                e.preventDefault();
                mutate({
                  amount: parseFloat(amount),
                  to: to,
                  timestamp: dateValue.toDate(),
                });
              }}
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Dialog>
      <Paper
        sx={{
          backgroundColor: theme.palette.background.alt,
          padding: "1rem 2rem",
          position: "fixed",
          margin: "0 1.5rem",
          bottom: "1.5rem",
          left: 0,
          right: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent={"space-between"}
          alignItems="center"
          gap={2}
        >
          <Typography fontWeight={"bold"} fontSize="1.2rem">
            Total
          </Typography>

          <Typography
            fontWeight={"bold"}
            fontSize="1.5rem"
            color={theme.palette.text.secondary}
          >
            $
            {user?.transactions
              ?.reduce((acc, transaction) => {
                return acc + parseFloat(transaction.amount);
              }, 0)
              .toFixed(2)}
          </Typography>
        </Stack>
      </Paper>
    </>
  );
};

export default Home;
