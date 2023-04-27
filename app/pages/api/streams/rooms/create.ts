import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data } = await axios.post(
      "https://iriko.testing.huddle01.com/api/v1/create-room",
      {
        title: "Stream Challenge",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_HUDDLE01_API_KEY,
        },
      }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}
