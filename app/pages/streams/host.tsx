import { useEventListener } from "@huddle01/react";
import { useRecorder } from "@huddle01/react/app-utils";
import { Audio, Video } from "@huddle01/react/components";
import {
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { Box, Stack, Typography } from "@mui/material";
import axios from "axios";
import Layout from "components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  MediumLoadingButton,
} from "components/styled";
import { useEffect, useRef, useState } from "react";

/**
 * Page for host a stream.
 */
export default function HostStream() {
  const { joinLobby, isLobbyJoined } = useLobby();
  const { isRoomJoined } = useRoom();
  const [roomId, setRoomId] = useState<string | undefined>();

  /**
   * Create room.
   */
  useEffect(() => {
    axios
      .post("/api/streams/rooms/create")
      .then((response) => setRoomId(response.data.data.roomId))
      .catch((error) => console.error(error));
  }, []);

  /**
   * Join lobby of room.
   */
  useEffect(() => {
    if (roomId && joinLobby.isCallable) {
      joinLobby(roomId);
    }
  }, [roomId, joinLobby]);

  return (
    <Layout maxWidth="md">
      {isRoomJoined ? (
        <Room roomId={roomId!} />
      ) : isLobbyJoined ? (
        <Lobby roomId={roomId!} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function Lobby(props: { roomId: string }) {
  const { state } = useMeetingMachine();
  const { joinRoom } = useRoom();
  const { fetchVideoStream, stopVideoStream, stream: camStream } = useVideo();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  return (
    <CardBox>
      {/* Data */}
      <Typography variant="h4" fontWeight={700}>
        Lobby
      </Typography>
      <Box mt={1}>
        <Typography fontWeight={700}>Room ID</Typography>
        <Typography>{props.roomId}</Typography>
      </Box>
      <Box mt={2}>
        <Typography fontWeight={700}>Room State</Typography>
        <Typography sx={{ wordBreak: "break-all" }}>
          {JSON.stringify(state.value)}
        </Typography>
      </Box>
      {/* Actions */}
      <Stack direction="row" spacing={1} mt={2}>
        <MediumLoadingButton
          variant="contained"
          disabled={true}
          onClick={() => {}}
        >
          Approve stream
        </MediumLoadingButton>
      </Stack>
      <Stack direction="row" spacing={1} mt={2}>
        <MediumLoadingButton
          variant="contained"
          disabled={!fetchVideoStream.isCallable}
          onClick={fetchVideoStream}
        >
          Enable video
        </MediumLoadingButton>
        <MediumLoadingButton
          variant="contained"
          disabled={!stopVideoStream.isCallable}
          onClick={stopVideoStream}
        >
          Disable video
        </MediumLoadingButton>
      </Stack>
      <Stack direction="row" spacing={1} mt={2}>
        <MediumLoadingButton
          variant="contained"
          disabled={!joinRoom.isCallable}
          onClick={joinRoom}
        >
          Start stream
        </MediumLoadingButton>
      </Stack>
      {/* Me */}
      <Box mt={2}>
        <Typography fontWeight={700}>Me</Typography>
        <video ref={videoRef} autoPlay muted></video>
      </Box>
    </CardBox>
  );
}

function Room(props: { roomId: string }) {
  const { state } = useMeetingMachine();
  const { produceVideo, stopProducingVideo, stream: camStream } = useVideo();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  return (
    <CardBox>
      {/* Data */}
      <Typography variant="h4" fontWeight={700}>
        Room
      </Typography>
      <Box mt={1}>
        <Typography fontWeight={700}>Room ID</Typography>
        <Typography>{props.roomId}</Typography>
      </Box>
      <Box mt={2}>
        <Typography fontWeight={700}>Room State</Typography>
        <Typography sx={{ wordBreak: "break-all" }}>
          {JSON.stringify(state.value)}
        </Typography>
      </Box>
      {/* Actions */}
      <Stack direction="row" spacing={1} mt={4}>
        <MediumLoadingButton
          variant="contained"
          disabled={!produceVideo.isCallable}
          onClick={() => produceVideo(camStream)}
        >
          Produce video
        </MediumLoadingButton>
        <MediumLoadingButton
          variant="contained"
          disabled={!stopProducingVideo.isCallable}
          onClick={() => stopProducingVideo()}
        >
          Stop producing video
        </MediumLoadingButton>
        <MediumLoadingButton
          variant="contained"
          disabled={true}
          onClick={() => {}}
        >
          Stop stream
        </MediumLoadingButton>
      </Stack>
      {/* Me */}
      <Box mt={2}>
        <Typography fontWeight={700}>Me</Typography>
        <video ref={videoRef} autoPlay muted></video>
      </Box>
      {/* Others */}
      <Box mt={2}>
        <Typography fontWeight={700}>Others</Typography>
        <Peers roomId={props.roomId} />
      </Box>
    </CardBox>
  );
}

function Peers(props: { roomId: string }) {
  const { peers } = usePeers();

  useRecorder(props.roomId, process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID || "");

  console.log("peers", peers);

  return (
    <Box>
      <Typography sx={{ wordBreak: "break-all" }}>
        {JSON.stringify(peers)}
      </Typography>
      {Object.values(peers)
        .filter((peer) => peer.cam)
        .map((peer) => (
          <Typography>{peer.displayName}</Typography>
        ))}
      {Object.values(peers)
        .filter((peer) => peer.cam)
        .map((peer) => (
          <Video
            key={peer.peerId}
            peerId={peer.peerId}
            track={peer.cam}
            // debug
          />
        ))}
      {Object.values(peers)
        .filter((peer) => peer.mic)
        .map((peer) => (
          <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
        ))}
    </Box>
  );
}
