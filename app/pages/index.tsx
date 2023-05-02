import { Box, SxProps, Typography } from "@mui/material";
import EntityList from "components/entity/EntityList";
import Layout from "components/layout";
import StreamCard from "components/stream/StreamCard";
import {
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
  LargeLoadingButton,
  ThickDivider,
} from "components/styled";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import useToasts from "hooks/useToast";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  chainToSupportedChainChallengeContractAddress,
  chainToSupportedChainId,
} from "utils/chains";
import { bigNumberTimestampToLocaleString } from "utils/converters";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  return (
    <Layout maxWidth="md">
      <Header />
      <ThickDivider sx={{ mt: 8, mb: 8 }} />
      <Challenge />
    </Layout>
  );
}

function Header(props: { sx?: SxProps }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h1" textAlign="center" maxWidth={880}>
        ✨ A new way to <strong>engage and interact</strong> with your{" "}
        <strong>audience</strong>
      </Typography>
      <Typography
        color="text.secondary"
        textAlign="center"
        mt={2}
        maxWidth={380}
      >
        Challenges where people have to stream every day at a random time
      </Typography>
      <ExtraLargeLoadingButton
        variant="contained"
        href="/#challenge"
        sx={{ mt: 4 }}
      >
        Go to challenge
      </ExtraLargeLoadingButton>
      <Box width={{ xs: "100%", md: "85%" }} mt={{ xs: 4, md: 8 }}>
        <Image
          src="/images/streamers.png"
          alt="Thoughts"
          width="100"
          height="100"
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Box>
    </Box>
  );
}

function Challenge(props: { sx?: SxProps }) {
  const { chain } = useNetwork();

  const {
    data: isLastChallengeFinished,
    isFetching: isLastChallengeFinishedFetching,
    refetch: isLastChallengeRefetch,
  } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "isLastChallengeFinished",
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Box
        id="challenge"
        component="a"
        sx={{
          display: "block",
          position: "relative",
          top: "-98px",
          visibility: "hidden",
        }}
      />
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🏆 Challenge
      </Typography>
      {!isLastChallengeFinishedFetching ? (
        isLastChallengeFinished ? (
          <ChallengeNotStarted
            onStarted={() => isLastChallengeRefetch()}
            sx={{ mt: 1 }}
          />
        ) : (
          <ChallengeStarted sx={{ mt: 1 }} />
        )
      ) : (
        <FullWidthSkeleton sx={{ mt: 1 }} />
      )}
    </Box>
  );
}

function ChallengeNotStarted(props: { onStarted: Function; sx?: SxProps }) {
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();

  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainChallengeContractAddress(chain),
      abi: challengeContractAbi,
      functionName: "startChallenge",
      chainId: chainToSupportedChainId(chain),
      onError(error: any) {
        showToastError(error);
      },
    });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractPrepareConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Challenge is started!");
      props.onStarted();
    }
  }, [isTransactionSuccess]);

  return (
    <>
      <Typography
        color="text.secondary"
        textAlign="center"
        sx={{ ...props.sx }}
      >
        is not yet started
      </Typography>
      <LargeLoadingButton
        variant="outlined"
        disabled={isContractPrepareError || !contractWrite}
        loading={isContractWriteLoading || isTransactionLoading}
        onClick={() => contractWrite?.()}
        sx={{ mt: 2 }}
      >
        Start
      </LargeLoadingButton>
    </>
  );
}

function ChallengeStarted(props: { sx?: SxProps }) {
  const { chain } = useNetwork();

  const { data: lastChallenge, isFetching: isLastChallengeFetching } =
    useContractRead({
      address: chainToSupportedChainChallengeContractAddress(chain),
      abi: challengeContractAbi,
      functionName: "getLastChallenge",
    });

  if (!lastChallenge) {
    return <FullWidthSkeleton sx={{ ...props.sx }} />;
  }

  return (
    <>
      <Typography
        color="text.secondary"
        textAlign="center"
        sx={{ ...props.sx }}
      >
        will be ended on{" "}
        {bigNumberTimestampToLocaleString(lastChallenge.finishTimestamp)}
      </Typography>
      <Link href="/streams/start" passHref legacyBehavior>
        <LargeLoadingButton variant="outlined" sx={{ mt: 2 }}>
          Participate
        </LargeLoadingButton>
      </Link>
      <ChallengeStreams sx={{ mt: 4 }} />
    </>
  );
}

function ChallengeStreams(props: { sx?: SxProps }) {
  const { chain } = useNetwork();

  const { data: streams } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "getLastChallengeStreams",
  });

  return (
    <EntityList
      entities={streams}
      renderEntityCard={(stream, index) => (
        <StreamCard
          authorAddress={stream.authorAddress}
          startedTimestamp={stream.startedTimestamp}
          finishedTimestamp={stream.finishedTimestamp}
          description={stream.description}
          key={index}
        />
      )}
      noEntitiesText="😐 no streams"
      sx={{ ...props.sx }}
    />
  );
}
