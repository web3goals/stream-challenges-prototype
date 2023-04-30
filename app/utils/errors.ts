import { ethers } from "ethers";
import { errorsLibraryAbi } from "contracts/abi/errorsLibrary";

/**
 * Convert error object to pretty object with error message and severity.
 */
export function errorToPrettyError(error: any): {
  message: string;
  severity: "info" | "error" | undefined;
} {
  let message = JSON.stringify(error);
  let severity: "info" | "error" | undefined = undefined;
  if (error?.message) {
    message = error.message;
  }
  if (error?.data?.message) {
    message = error.data.message.replace("execution reverted: ", "");
  }
  if (error?.error?.data?.message) {
    message = error.error.data.message.replace("execution reverted: ", "");
  }
  if (error?.error?.data?.data) {
    message = new ethers.utils.Interface(errorsLibraryAbi).parseError(
      error.error.data.data
    ).signature;
  }
  if (message.includes("insufficient funds for gas * price + value")) {
    message = "Insufficient funds to execute the transaction";
  }
  return {
    message: message,
    severity: severity,
  };
}
