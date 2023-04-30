import AccountEditProfileForm from "components/account/AccountEditProfileForm";
import Layout from "components/layout";
import { FullWidthSkeleton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import { ethers } from "ethers";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import { useEffect, useState } from "react";
import { chainToSupportedChainProfileContractAddress } from "utils/chains";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page to edit account.
 */
export default function EditAccount() {
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { loadJsonFromIpfs } = useIpfs();
  const [profileData, setProfileData] = useState<
    ProfileUriDataEntity | null | undefined
  >();

  // Contract states
  const {
    status: contractReadStatus,
    error: contractReadError,
    data: contractReadData,
  } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [ethers.utils.getAddress(address || ethers.constants.AddressZero)],
  });

  useEffect(() => {
    if (address && contractReadStatus === "success") {
      if (contractReadData) {
        loadJsonFromIpfs(contractReadData)
          .then((result) => setProfileData(result))
          .catch((error) => handleError(error, true));
      } else {
        setProfileData(null);
      }
    }
    if (address && contractReadStatus === "error" && contractReadError) {
      setProfileData(null);
    }
  }, [address, contractReadStatus, contractReadError, contractReadData]);

  return (
    <Layout maxWidth="xs">
      {profileData !== undefined ? (
        <AccountEditProfileForm profileData={profileData} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
