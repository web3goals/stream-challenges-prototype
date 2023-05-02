import { Avatar, SxProps, Typography } from "@mui/material";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import { emojiAvatarForAddress } from "utils/avatars";
import { ipfsUriToHttpUri } from "utils/converters";

/**
 * Component with account avatar.
 */
export default function AccountAvatar(props: {
  accountAddress: string;
  accountProfileUriData?: ProfileUriDataEntity;
  size?: number;
  emojiSize?: number;
  sx?: SxProps;
}) {
  return (
    <Avatar
      sx={{
        width: props.size || 48,
        height: props.size || 48,
        borderRadius: props.size || 48,
        background: emojiAvatarForAddress(props.accountAddress).color,
        ...props.sx,
      }}
      src={
        props.accountProfileUriData?.image
          ? ipfsUriToHttpUri(props.accountProfileUriData.image)
          : undefined
      }
    >
      <Typography fontSize={props.emojiSize || 22}>
        {emojiAvatarForAddress(props.accountAddress).emoji}
      </Typography>
    </Avatar>
  );
}
