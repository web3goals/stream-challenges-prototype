import { useRecorder } from "@huddle01/react/app-utils";
import { Audio, Video } from "@huddle01/react/components";
import { usePeers } from "@huddle01/react/hooks";
import { Typography } from "@mui/material";
import Layout from "components/layout";
import { CardBox } from "components/styled";
import { useRouter } from "next/router";

/**
 * Page for join a stream.
 */
export default function JoinStream() {
  const router = useRouter();
  const { slug } = router.query;

  const { peers } = usePeers();

  useRecorder(
    slug?.toString() || "",
    process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID || ""
  );

  console.log("peers", peers);

  return (
    <Layout maxWidth="md">
      <CardBox>
        <Typography fontWeight={700}>Peers</Typography>
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
      </CardBox>
    </Layout>
  );
}
