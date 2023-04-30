import axios from "axios";
import { ipfsUriToHttpUri } from "utils/converters";

/**
 * Hook for work with IPFS.
 */
export default function useIpfs() {
  const ipfsUriPrefix = "ipfs://";

  let uploadFileToIpfs = async function (file: any): Promise<{
    cid: string;
    uri: string;
  }> {
    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    // Make request
    const response = await axios.post(
      "https://node.lighthouse.storage/api/v0/add",
      formData,
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          "Content-type": `multipart/form-data; boundary= ${Symbol().toString()}`,
          Encryption: `${false}`,
          "Mime-Type": file.type,
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
        },
      }
    );
    // Return result
    const cid = response.data.Hash;
    const uri = `${ipfsUriPrefix}${cid}`;
    return { cid, uri };
  };

  let uploadJsonToIpfs = async function (json: object): Promise<{
    cid: string;
    uri: string;
  }> {
    const file = new File([JSON.stringify(json)], "", {
      type: "text/plain",
    });
    return uploadFileToIpfs(file);
  };

  let loadJsonFromIpfs = async function (uri: string): Promise<any> {
    const response = await axios.get(ipfsUriToHttpUri(uri));
    if (response.data.errors) {
      throw new Error(
        `Fail to loading json from IPFS: ${response.data.errors}`
      );
    }
    return response.data;
  };

  return {
    uploadFileToIpfs,
    uploadJsonToIpfs,
    loadJsonFromIpfs,
  };
}
