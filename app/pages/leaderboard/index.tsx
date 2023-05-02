import { Box, Typography } from "@mui/material";
import EntityList from "components/entity/EntityList";
import Layout from "components/layout";
import StreamerCard from "components/streamer/StreamerCard";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import { chainToSupportedChainChallengeContractAddress } from "utils/chains";
import { useContractRead, useNetwork } from "wagmi";

/**
 * Page with the leaderboard
 */
export default function Leaderboard() {
  const { chain } = useNetwork();

  const { data: streamers } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "getStreamers",
  });

  return (
    <Layout maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🏆 Leaderboard
        </Typography>
        <EntityList
          entities={
            streamers
              ? [...streamers].sort((s1, s2) =>
                  s2.successfulStreams.sub(s1.successfulStreams).toNumber()
                )
              : undefined
          }
          renderEntityCard={(streamer, index) => (
            <StreamerCard
              key={index}
              accountAddress={streamer.accountAddress}
              successfulStreams={streamer.successfulStreams.toNumber()}
            />
          )}
          noEntitiesText="😐 no streamers"
          sx={{ mt: 2 }}
        />
      </Box>
    </Layout>
  );
}
