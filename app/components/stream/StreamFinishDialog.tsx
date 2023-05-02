import { Box, Dialog, Typography } from "@mui/material";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetTitle,
} from "components/styled";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import useToasts from "hooks/useToast";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { palette } from "theme/palette";
import {
  chainToSupportedChainChallengeContractAddress,
  chainToSupportedChainId,
} from "utils/chains";
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

/**
 * Dialog to finish a stream.
 */
export default function StreamFinishDialog(props: {
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { showToastSuccess, showToastError } = useToasts();
  const { uploadFileToIpfs } = useIpfs();

  // Dialog states
  const [isOpen, setIsOpen] = useState(!props.isClose);

  // Form states
  const [recording, setRecording] = useState<{
    file: any;
    uri: any;
  }>();
  const [recordingUri, setRecordingUri] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Contract states
  const { config: contractPrepareConfig } = usePrepareContractWrite({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "finishStream",
    args: [recordingUri],
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

  const isFormDisabled =
    isFormSubmitting ||
    isContractWriteLoading ||
    isTransactionLoading ||
    isTransactionSuccess;

  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  async function onRecordingChange(files: any[]) {
    try {
      // Get file
      const file = files?.[0];
      if (!file) {
        return;
      }
      // Read and save file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.readyState === 2) {
          setRecording({
            file: file,
            uri: fileReader.result,
          });
        }
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      handleError(error, true);
    }
  }

  async function submit() {
    try {
      setIsFormSubmitting(true);
      if (!recording?.file) {
        throw new Error("File is not attached");
      }
      const { uri } = await uploadFileToIpfs(recording.file);
      setRecordingUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  // Write data to contract if recording is uploaded
  useEffect(() => {
    if (recordingUri !== "" && contractWrite && !isContractWriteLoading) {
      contractWrite?.();
      setRecordingUri("");
      setIsFormSubmitting(false);
    }
  }, [recordingUri, contractWrite, isContractWriteLoading]);

  // Handle transaction success to show success message
  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Stream is finished!");
      props.onSuccess?.();
      close();
    }
  }, [isTransactionSuccess]);

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🏁 Attach recording
        </Typography>
        <Typography textAlign="center" mt={1}>
          to finish stream and earn points for the leaderboard
        </Typography>
        {/* Attachment input */}
        <WidgetBox bgcolor={palette.purpleDark} mt={2} sx={{ width: 1 }}>
          <WidgetTitle>Recording</WidgetTitle>
          <Dropzone
            multiple={false}
            disabled={isFormDisabled}
            onDrop={(files) => onRecordingChange(files)}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Box
                  sx={{
                    cursor: !isFormDisabled ? "pointer" : undefined,
                    bgcolor: "#FFFFFF",
                    py: 2,
                    px: 2,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    color="text.disabled"
                    sx={{ lineBreak: "anywhere" }}
                  >
                    {recording?.file?.name ||
                      "Drag 'n' drop some files here, or click to select files"}
                  </Typography>
                </Box>
              </div>
            )}
          </Dropzone>
        </WidgetBox>
        {/* Submit button */}
        <ExtraLargeLoadingButton
          loading={
            isFormSubmitting || isContractWriteLoading || isTransactionLoading
          }
          variant="outlined"
          type="submit"
          disabled={isFormDisabled || !contractWrite}
          onClick={() => submit()}
          sx={{ mt: 2 }}
        >
          Submit
        </ExtraLargeLoadingButton>
      </DialogCenterContent>
    </Dialog>
  );
}
