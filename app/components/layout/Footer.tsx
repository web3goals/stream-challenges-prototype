import { Box, SxProps, Typography } from "@mui/material";
import { Container } from "@mui/system";

/**
 * Component with a footer.
 */
export default function Footer(props: { sx?: SxProps }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...props.sx,
      }}
    >
      <Quote />
      <Copyright />
    </Box>
  );
}

function Copyright(props: { sx?: SxProps }) {
  return (
    <Container maxWidth="md" sx={{ my: 4, ...props.sx }}>
      <Typography color="text.secondary" variant="body2" textAlign="center">
        Stream Challenges © 2023
      </Typography>
    </Container>
  );
}

function Quote(props: { sx?: SxProps }) {
  return (
    <Box
      width={1}
      py={{ xs: 6, md: 8 }}
      sx={{ backgroundColor: "purpleDark", ...props.sx }}
    >
      <Container maxWidth="md" sx={{ color: "white", textAlign: "center" }}>
        <Typography variant="h4">💬</Typography>
        <Typography variant="h4" fontWeight={700} mt={4}>
          “A year from now you may wish you had started today“
        </Typography>
        <Typography fontWeight={700} mt={4}>
          — Karen Lamb
        </Typography>
      </Container>
    </Box>
  );
}
