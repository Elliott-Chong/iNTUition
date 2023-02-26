import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import querystring from "querystring";
import parserHandler from "../../../../parser";
import type { transactionType } from "../../../../parser";
import mongoose from "mongoose";
import Users from "../../../../../models/User";
import jwt from "jsonwebtoken";

type User = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

async function getTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) {
  /*
    Returns:
    Promise<{
      access_token: string;
      expires_in: Number;
      refresh_token: string;
      scope: string;
      id_token: string;
    }>
    */
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data as { id_token: string; access_token: string };
  } catch (error) {
    console.error("elliottttsdfd", error.message);
  }
}

const resolver = async (req: NextApiRequest, res: NextApiResponse) => {
  mongoose.connect(process.env.DATABASE_URL).catch((err) => console.log(err));
  const code = req.query.code as string;
  const { id_token, access_token } = await getTokens(
    code,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://intuition-auto-track.vercel.app/api/auth/google/redirect"
  );
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    const profile = response.data as User;
    const urlencoded_email = querystring.escape(profile.email);
    const endpoint = `https://content-gmail.googleapis.com/gmail/v1/users/${urlencoded_email}/messages?maxResults=100&key=${process.env.GOOGLE_API_KEY}`;
    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    };
    const email_ids = await axios.get<{ messages: { id: string }[] }>(
      endpoint,
      config
    );
    const { messages } = email_ids.data;
    let emails = [];

    for (const message of messages) {
      const endpoint = `https://gmail.googleapis.com/gmail/v1/users/${urlencoded_email}/messages/${message.id}`;
      emails.push(axios.get(endpoint, config));
    }
    emails = (await Promise.all(emails)) as {
      data: {
        snippet: string;
        payload: { parts: { body: { data: string } }[] };
      };
    }[];
    emails = emails.map(
      (email: {
        data: {
          id: string;
          snippet: string;
          payload: { parts: { body: { data: string } }[] };
        };
      }) => {
        const snippet = email.data.snippet;
        if (snippet.toLowerCase().includes("transaction alert")) {
          const base64EncodedString = email.data.payload.parts[0]?.body?.data;
          const regularString = Buffer.from(
            base64EncodedString,
            "base64"
          ).toString();
          return {
            snippet: snippet,
            body: regularString,
            id: email.data.id,
          };
        } else {
          return false;
        }
      }
    );
    emails = emails.filter((email) => email !== false);
    emails = parserHandler(emails as { body: string }[]);
    console.log("elliott", emails.length);
    const user = await Users.findOne({ googleId: profile.id });
    if (user) {
      let uniqueArray: transactionType[] = [
        ...(user.transactions as transactionType[]),
        ...(emails as transactionType[]),
      ].reduce((acc, curr) => {
        if (
          !acc.find(
            (item) =>
              item.timestamp.toString() + item.amount.toString() ===
              curr.timestamp.toString() + curr.amount.toString()
          )
        ) {
          acc.push(curr);
        }
        return acc;
      }, [] as transactionType[]);
      user.transactions = uniqueArray;
      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
        if (err) throw err;
        return res
          .redirect(
            `https://intuition-auto-track.vercel.app/google/success?token=${token}`
            //   `https://hack-n-roll-374701.web.app/google/success?token=${token}`
          )
          .send("success");
      });
    } else {
      const new_user = await Users.create({
        googleId: profile.id,
        email: profile.email,
        profile_img: profile.picture,
        name: profile.given_name + " " + profile.family_name,
        transactions: emails,
      });
      await new_user.save();
      const payload = {
        user: {
          id: new_user.id,
        },
      };
      jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
        if (err) throw err;
        return res
          .redirect(
            `https://intuition-auto-track.vercel.app/google/success?token=${token}`
            //   `https://hack-n-roll-374701.web.app/google/success?token=${token}`
          )
          .send("nice");
      });
    }
  } catch (error) {
    console.error(error.message);
    // return res.status(500).send("server error"); // @ts-ignore
    return res.status(500).json({ error: error.message });
  }
};
export default resolver;
