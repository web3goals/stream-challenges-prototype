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
      proxy: "0x6Dde174788fCA1115819A1c3470AE5B359ac01C9",
      impl: "0x6Dde174788fCA1115819A1c3470AE5B359ac01C9",
    },
  },
};
