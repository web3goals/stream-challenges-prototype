import { Box, Typography } from "@mui/material";
import axios from "axios";
import FormikHelper from "components/helper/FormikHelper";
import Layout from "components/layout";
import {
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "components/styled";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import { Form, Formik } from "formik";
import useDebounce from "hooks/useDebounce";
import useToasts from "hooks/useToast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { palette } from "theme/palette";
import {
  chainToSupportedChainChallengeContractAddress,
  chainToSupportedChainId,
} from "utils/chains";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page for start a stream.
 */
export default function StartStream() {
  const { push } = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { showToastSuccess, showToastError } = useToasts();
  const [streamRoomId, setStreamRoomId] = useState<string | undefined>();

  // Form states
  const [formValues, setFormValues] = useState({
    description: "Participating in the hackathon",
  });
  const formValidationSchema = yup.object({
    description: yup.string().required(),
  });
  const debouncedFormValues = useDebounce(formValues);

  // Contract states
  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainChallengeContractAddress(chain),
      abi: challengeContractAbi,
      functionName: "startStream",
      args: [streamRoomId || "", debouncedFormValues.description],
      chainId: chainToSupportedChainId(chain),
      enabled: streamRoomId !== undefined,
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

  // Form states
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitButtonDisabled =
    isFormDisabled || isContractPrepareError || !contractWrite;

  // Create room
  useEffect(() => {
    axios
      .post("/api/streams/rooms/create")
      .then((response) => setStreamRoomId(response.data.data.roomId))
      .catch((error) => console.error(error));
  }, []);

  // Display success message
  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Stream is started!");
      push(`/streams/${address}`);
    }
  }, [isTransactionSuccess]);

  return (
    <Layout maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🚀 Start stream
        </Typography>
        <Typography color="text.secondary" textAlign="center" mt={1}>
          to participate in the challenge
        </Typography>
        <Formik
          initialValues={formValues}
          validationSchema={formValidationSchema}
          onSubmit={() => contractWrite?.()}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <FormikHelper onChange={(values: any) => setFormValues(values)} />
              {/* Description input */}
              <WidgetBox bgcolor={palette.blue} mt={2}>
                <WidgetTitle>Description</WidgetTitle>
                <WidgetInputTextField
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  disabled={isFormDisabled}
                  multiline
                  maxRows={4}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <ExtraLargeLoadingButton
                loading={isFormLoading}
                variant="outlined"
                type="submit"
                disabled={isFormSubmitButtonDisabled}
                sx={{ mt: 2 }}
              >
                Submit
              </ExtraLargeLoadingButton>
            </Form>
          )}
        </Formik>
      </Box>
    </Layout>
  );
}
