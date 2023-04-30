interface DeployedContract {
  name: string;
  isUpgreadable: boolean;
  isInitializable: boolean;
  proxy?: string; // Or "impl" if contract deployed without proxy
  proxyAdmin?: string;
  impl?: string;
}

export const contracts: {
  [key: string]: {
    profile: DeployedContract;
    challenge: DeployedContract;
  };
} = {
  hyperspace: {
    profile: {
      name: "Profile",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x0197249adA3c806E7c0029651e10defD2572C8cc",
      impl: "0x0197249adA3c806E7c0029651e10defD2572C8cc",
    },
    challenge: {
      name: "Challenge",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xD9B74758b605B2EcAE3E638A62cb858eD3fbc93a",
      impl: "0xD9B74758b605B2EcAE3E638A62cb858eD3fbc93a",
    },
  },
};
