import { parse } from "node-html-parser";

function getAllInnerText(node: Node): string {
  const nodes = node.getElementsByTagName("body");
  let innerTextArray = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.innerText) {
      innerTextArray.push(node.innerText.trim());
    }
  }
  innerTextArray = innerTextArray.filter((item) => item !== "");
  let res = innerTextArray.join(" ");
  res = res.replace(/(\r\n|\n|\r)/gm, "");
  return res;
}

const parseEmail = (email: string) => {
  return parse(email);
};

export type transactionType = {
  amount: number;
  timestamp: string | Date;
  to: string;
  type: "PayLah!" | "PayNow";
};

const parsePayLah = (raw_text: string): transactionType => {
  const result = {
    amount: 0,
    timestamp: "",
    to: "",
    type: "PayLah!" as const,
  };
  const time_index = raw_text.indexOf("Time:") + 5;
  for (let i = time_index; i < raw_text.length; i++) {
    if (raw_text[i] === ")") {
      result.timestamp = raw_text.slice(time_index, i + 1);
      break;
    }
  }
  const amount_index = raw_text.indexOf("SGD") + 3;
  for (let i = amount_index; i < raw_text.length; i++) {
    if (raw_text[i] === "F") {
      result.amount = parseFloat(raw_text.slice(amount_index, i)) * -1;
      break;
    }
  }
  const to_index = raw_text.indexOf("To:") + 3;
  for (let i = to_index; i < raw_text.length; i++) {
    if (raw_text.slice(i, i + 7) === "To view") {
      result.to = raw_text.slice(to_index, i).trim();
      break;
    }
  }

  return result;
};

const parsePayNow = (raw_text: string): transactionType => {
  const result = {
    amount: 0,
    timestamp: "",
    to: "",
    type: "PayNow" as const,
  };
  const time_index = raw_text.indexOf(" on ") + 4;
  for (let i = time_index; i < raw_text.length; i++) {
    if (raw_text[i] === ")") {
      result.timestamp = raw_text.slice(time_index, i + 1);
      break;
    }
  }
  const amount_index = raw_text.indexOf("SGD ") + 4;
  for (let i = amount_index; i < raw_text.length; i++) {
    if (raw_text[i] === " ") {
      result.amount = parseFloat(raw_text.slice(amount_index, i));
      break;
    }
  }
  const to_index = raw_text.indexOf(" from ") + 6;
  for (let i = to_index; i < raw_text.length; i++) {
    if (raw_text.slice(i, i + 3) === " to") {
      result.to = raw_text.slice(to_index, i).trim();
      break;
    }
  }
  return result;
};

const parseInfo = (raw_text: string): transactionType => {
  if (raw_text.includes("PayLah!")) return parsePayLah(raw_text);
  else if (raw_text.includes("PayNow")) return parsePayNow(raw_text);
};

const handler = (data: { body: string }[]): transactionType[] => {
  const temp: string[] = [];
  for (const i of data) {
    const email = parseEmail(i.body);
    const rawText = getAllInnerText(email as unknown as Node);
    temp.push(rawText);
  }
  const result: transactionType[] = [];
  for (const raw_text of temp) {
    const info = parseInfo(raw_text);
    info.timestamp = info.timestamp?.replace(" (SGT)", "");
    info.timestamp =
      new Date().getFullYear().toString() + " " + info.timestamp.toString();
    info.timestamp = new Date(info.timestamp);
    info.timestamp = info.timestamp.toLocaleString("en-US", {
      timeZone: "Singapore",
    });
    result.push(info);
  }

  return result;
};

export default handler;
