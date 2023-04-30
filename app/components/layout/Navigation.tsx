import { GitHub, MenuRounded } from "@mui/icons-material";
import {
  AppBar,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  ListItemIcon,
  Menu,
  MenuItem,
  SxProps,
  Toolbar,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTACTS } from "constants/contacts";
import Link from "next/link";
import packageJson from "package.json";
import { useState } from "react";
import { chainToSupportedChainConfig } from "utils/chains";
import { isDev } from "utils/environment";
import { useAccount, useNetwork } from "wagmi";

/**
 * Component with navigation.
 */
export default function Navigation() {
  return (
    <AppBar
      color="inherit"
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LogoDesktop
            sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}
          />
          <LogoMobile
            sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1 }}
          />
          <NavigationDesktop
            sx={{ display: { xs: "none", md: "flex" }, ml: 1 }}
          />
          <NavigationMobile
            sx={{ display: { xs: "flex", md: "none" }, ml: 1 }}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function LogoDesktop(props: { sx?: SxProps }) {
  const { chain } = useNetwork();

  return (
    <Box sx={{ alignItems: "center", ...props.sx }}>
      <Link href="/" passHref legacyBehavior>
        <MuiLink variant="h6" color="#000000" fontWeight={700}>
          🏆 Stream Challenges
        </MuiLink>
      </Link>
      <Typography color="text.secondary" variant="caption" ml={1}>
        {packageJson.version}-{isDev() ? "dev" : "beta"} |{" "}
        {chainToSupportedChainConfig(chain).chain.id}
      </Typography>
    </Box>
  );
}

function LogoMobile(props: { sx?: SxProps }) {
  const { chain } = useNetwork();

  return (
    <Box sx={{ flexDirection: "column", ...props.sx }}>
      <Link href="/" passHref legacyBehavior>
        <MuiLink variant="h6" color="#000000" fontWeight={700}>
          🏆 SC
        </MuiLink>
      </Link>
      <Typography color="text.secondary" variant="caption">
        {packageJson.version}-{isDev() ? "dev" : "beta"} |{" "}
        {chainToSupportedChainConfig(chain).chain.id}
      </Typography>
    </Box>
  );
}

function NavigationDesktop(props: { sx?: SxProps }) {
  const { isConnected, address } = useAccount();

  return (
    <Box sx={{ alignItems: "center", ...props.sx }}>
      {isConnected && (
        <Link href={`/accounts/${address}`} passHref legacyBehavior>
          <MuiLink fontWeight={700} color="inherit" ml={3.5}>
            Account
          </MuiLink>
        </Link>
      )}
      <Link href="/#challenge" passHref legacyBehavior>
        <MuiLink fontWeight={700} color="inherit" ml={3.5}>
          Challenge
        </MuiLink>
      </Link>
      <Link href="/leaderboard" passHref legacyBehavior>
        <MuiLink fontWeight={700} color="inherit" ml={3.5}>
          Leaderboard
        </MuiLink>
      </Link>
      <Box ml={3.5}>
        <ConnectButton showBalance={false} accountStatus="full" />
      </Box>
      <NavigationMenu sx={{ ml: 1.5 }} />
    </Box>
  );
}

function NavigationMobile(props: { sx?: SxProps }) {
  return (
    <Box sx={{ alignItems: "center", ...props.sx }}>
      <ConnectButton
        showBalance={false}
        accountStatus="avatar"
        chainStatus="icon"
      />
      <NavigationMenu
        displayAccountLink
        displayChallengeLink
        displayLeaderboardLink
        sx={{ ml: 1.5 }}
      />
    </Box>
  );
}

function NavigationMenu(props: {
  displayAccountLink?: boolean;
  displayChallengeLink?: boolean;
  displayLeaderboardLink?: boolean;
  sx?: SxProps;
}) {
  const { isConnected, address } = useAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "navigation-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{ ...props.sx }}
      >
        <MenuRounded />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="navigation-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {props.displayAccountLink && isConnected && (
          <Link href={`/accounts/${address}`} passHref legacyBehavior>
            <MenuItem>Account</MenuItem>
          </Link>
        )}
        {props.displayChallengeLink && (
          <Link href="/#challenge" passHref legacyBehavior>
            <MenuItem>Challenge</MenuItem>
          </Link>
        )}
        {props.displayLeaderboardLink && (
          <Link href="/leaderboard" passHref legacyBehavior>
            <MenuItem>Leaderboard</MenuItem>
          </Link>
        )}
        <Divider />
        <MenuItem component="a" target="_blank" href={CONTACTS.github}>
          <ListItemIcon>
            <GitHub fontSize="small" />
          </ListItemIcon>
          GitHub
        </MenuItem>
      </Menu>
    </>
  );
}
