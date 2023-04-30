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
      proxy: "0x5dD311d5b77bc198b023B3AEbe81c3E6Fb38ee25",
      impl: "0x5dD311d5b77bc198b023B3AEbe81c3E6Fb38ee25",
    },
  },
};
