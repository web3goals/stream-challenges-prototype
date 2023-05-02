import { Box, Link as MuiLink, SxProps, Typography } from "@mui/material";
import AccountAvatar from "components/account/AccountAvatar";
import AccountLink from "components/account/AccountLink";
import { CardBox } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import { BigNumber, ethers } from "ethers";
import useUriDataLoader from "hooks/useUriDataLoader";
import { chainToSupportedChainProfileContractAddress } from "utils/chains";
import { bigNumberTimestampToLocaleString } from "utils/converters";
import { useContractRead, useNetwork } from "wagmi";

/**
 * A component with a stream card.
 */
export default function StreamCard(props: {
  authorAddress: string;
  startedTimestamp: BigNumber;
  finishedTimestamp: BigNumber;
  description: string;
  sx?: SxProps;
}) {
  const { chain } = useNetwork();

  const { data: authorProfileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [ethers.utils.getAddress(props.authorAddress)],
  });

  const { data: authorProfileUriData } =
    useUriDataLoader<ProfileUriDataEntity>(authorProfileUri);

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          accountAddress={props.authorAddress}
          accountProfileUriData={authorProfileUriData}
        />
      </Box>
      {/* Right part */}
      <Box width={1} ml={1.5} display="flex" flexDirection="column">
        {/* Account */}
        <AccountLink
          accountAddress={props.authorAddress}
          accountProfileUriData={authorProfileUriData}
        />
        <Typography color="text.secondary" variant="body2">
          {bigNumberTimestampToLocaleString(props.startedTimestamp)}
        </Typography>
        {/* Description */}
        <MuiLink
          href={`/streams/${props.authorAddress}`}
          fontWeight={700}
          mt={1.5}
        >
          {props.description}
        </MuiLink>
        {/* Status */}
        <Typography
          variant="body2"
          color={
            props.finishedTimestamp.eq(ethers.constants.Zero)
              ? "yellow"
              : "green"
          }
          mt={1.5}
        >
          {props.finishedTimestamp.eq(ethers.constants.Zero)
            ? "🔥 Stream is active"
            : "✅ Stream is finished"}
        </Typography>
      </Box>
    </CardBox>
  );
}
