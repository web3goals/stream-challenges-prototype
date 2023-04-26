import { Typography } from "@mui/material";
import Layout from "components/layout";

/**
 * Landing page.
 */
export default function Landing() {
  return (
    <Layout maxWidth="md">
      <Typography variant="h1" textAlign="center">
        Welcome to <strong>Stream Challenges</strong>!
      </Typography>
    </Layout>
  );
}
