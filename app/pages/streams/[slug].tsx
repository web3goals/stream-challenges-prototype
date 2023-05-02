import { useRecorder } from "@huddle01/react/app-utils";
import { Audio, Video } from "@huddle01/react/components";
import {
  useLobby,
  usePeers,
  useRecording,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { Box, Stack, Typography } from "@mui/material";
import Layout from "components/layout";
import { FullWidthSkeleton, LargeLoadingButton } from "components/styled";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { isAddressesEqual } from "utils/addresses";
import { chainToSupportedChainChallengeContractAddress } from "utils/chains";
import { stringToAddress } from "utils/converters";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page with a stream.
 */
export default function Stream() {
  const router = useRouter();
  const { slug } = router.query;
  const { chain } = useNetwork();
  const { joinLobby, isLobbyJoined } = useLobby();
  const { isRoomJoined } = useRoom();

  const { data: stream } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "getLastChallengeStreamByAuthorAddress",
    args: [stringToAddress(slug as string) || ethers.constants.AddressZero],
  });

  // Join lobby when stream data is loaded.
  useEffect(() => {
    if (stream && joinLobby.isCallable) {
      joinLobby(stream.identifier);
    }
  }, [stream, joinLobby]);

  return (
    <Layout maxWidth="md">
      {isRoomJoined ? (
        <StreamRoom
          id={stream?.identifier}
          authorAddress={stream?.authorAddress}
          description={stream?.description}
        />
      ) : isLobbyJoined ? (
        <StreamLobby />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function StreamLobby() {
  const { joinRoom } = useRoom();
  const { fetchVideoStream, stopVideoStream, stream: videoStream } = useVideo();
  const videoStreamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoStream && videoStreamRef.current) {
      videoStreamRef.current.srcObject = videoStream;
    }
  }, [videoStreamRef, videoStream]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        ⚙️ Config camera, microphone
      </Typography>
      <Typography color="text.secondary" textAlign="center" mt={1}>
        and join stream
      </Typography>
      {/* Actions */}
      <Stack spacing={2} mt={2} minWidth={280}>
        <LargeLoadingButton
          variant="contained"
          disabled={!joinRoom.isCallable}
          onClick={joinRoom}
        >
          Join
        </LargeLoadingButton>
        <LargeLoadingButton
          variant="outlined"
          disabled={!fetchVideoStream.isCallable && !stopVideoStream.isCallable}
          onClick={() => {
            if (fetchVideoStream.isCallable) {
              fetchVideoStream();
            } else if (stopVideoStream.isCallable) {
              stopVideoStream();
            }
          }}
        >
          {fetchVideoStream.isCallable
            ? "Enable camera"
            : stopVideoStream.isCallable
            ? "Disable camera"
            : "Loading camera..."}
        </LargeLoadingButton>
      </Stack>
      {/* Video stream */}
      {videoStream?.active && (
        <Box mt={4}>
          <video
            ref={videoStreamRef}
            autoPlay
            muted
            style={{ width: "360px", borderRadius: "24px" }}
          />
        </Box>
      )}
    </Box>
  );
}

function StreamRoom(props: {
  id?: string;
  description?: string;
  authorAddress?: string;
}) {
  const { address } = useAccount();
  const { produceVideo, stopProducingVideo, stream: videoStream } = useVideo();
  const { peers } = usePeers();
  const {
    startRecording,
    stopRecording,
    error: recordingError,
    data: recordingData,
  } = useRecording();
  const videoStreamRef = useRef<HTMLVideoElement>(null);

  useRecorder(
    props.id || "",
    process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID || ""
  );

  useEffect(() => {
    if (videoStream && videoStreamRef.current) {
      videoStreamRef.current.srcObject = videoStream;
    }
  }, [videoStreamRef, videoStream]);

  // Open link with recording in new tab
  useEffect(() => {
    if ((recordingData as any)?.s3URL) {
      window.open((recordingData as any).s3URL);
    }
  }, [recordingData]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        👀 Stream - {props.description}
      </Typography>
      {/* Actions */}
      <Stack spacing={2} mt={2} minWidth={320}>
        <LargeLoadingButton
          variant="outlined"
          disabled={!produceVideo.isCallable && !stopProducingVideo.isCallable}
          onClick={() => {
            if (produceVideo.isCallable) {
              produceVideo(videoStream);
            } else if (stopProducingVideo.isCallable) {
              stopProducingVideo();
            }
          }}
        >
          {produceVideo.isCallable
            ? "Produce camera"
            : stopProducingVideo.isCallable
            ? "Stop producing camera"
            : "Loading camera..."}
        </LargeLoadingButton>
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="contained"
            disabled={!startRecording.isCallable}
            onClick={() => {
              console.log(
                `https://${window.location.host}/streams/rec/${props.id}`
              );
              startRecording(
                `https://${window.location.host}/streams/rec/${props.id}`
              );
            }}
          >
            Start recording
          </LargeLoadingButton>
        )}
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="contained"
            disabled={!stopRecording.isCallable}
            onClick={() => stopRecording()}
          >
            Stop recording
          </LargeLoadingButton>
        )}
        {/* TODO: Implement button */}
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="contained"
            disabled={true}
            onClick={() => {}}
          >
            Finish stream
          </LargeLoadingButton>
        )}
      </Stack>
      {/* Video stream */}
      {videoStream?.active && (
        <Box mt={4}>
          <video
            ref={videoStreamRef}
            autoPlay
            muted
            style={{ width: "360px", borderRadius: "24px" }}
          />
        </Box>
      )}
      {/* Peers */}
      <Box mt={4}>
        {Object.values(peers)
          .filter((peer) => peer.cam)
          .map((peer) => (
            <Video
              key={peer.peerId}
              peerId={peer.peerId}
              track={peer.cam}
              style={{ width: "180px", borderRadius: "24px" }}
            />
          ))}
        {Object.values(peers)
          .filter((peer) => peer.mic)
          .map((peer) => (
            <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
          ))}
      </Box>
    </Box>
  );
}
