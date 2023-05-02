import { Box, Divider, SxProps, Typography } from "@mui/material";
import { CardBox } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import { ethers } from "ethers";
import useUriDataLoader from "hooks/useUriDataLoader";
import { palette } from "theme/palette";
import { chainToSupportedChainProfileContractAddress } from "utils/chains";
import { useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "../account/AccountAvatar";
import AccountLink from "../account/AccountLink";

/**
 * A component with a streamer card.
 */
export default function StreamerCard(props: {
  accountAddress: string;
  successfulStreams: number;
  sx?: SxProps;
}) {
  const { chain } = useNetwork();

  const { data: accountProfileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [ethers.utils.getAddress(props.accountAddress)],
  });

  const { data: accountProfileUriData } =
    useUriDataLoader<ProfileUriDataEntity>(accountProfileUri);

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          accountAddress={props.accountAddress}
          accountProfileUriData={accountProfileUriData}
          size={64}
          emojiSize={28}
        />
      </Box>
      {/* Right part */}
      <Box width={1} ml={1.5} display="flex" flexDirection="column">
        <Typography fontWeight={700} color={palette.green}>
          {props.successfulStreams} successful streams
        </Typography>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <AccountLink
          accountAddress={props.accountAddress}
          accountProfileUriData={accountProfileUriData}
        />
        {accountProfileUriData?.attributes[1].value && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {accountProfileUriData?.attributes[1].value}
          </Typography>
        )}
      </Box>
    </CardBox>
  );
}
