import { SxProps, Typography } from "@mui/material";
import { Container } from "@mui/system";

/**
 * Component with a footer.
 */
export default function Footer(props: { sx?: SxProps }) {
  return (
    <Container maxWidth="md" sx={{ my: 4, ...props.sx }}>
      <Typography color="text.secondary" variant="body2" textAlign="center">
        Stream Challenges © 2023
      </Typography>
    </Container>
  );
}
