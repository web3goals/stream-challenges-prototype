// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library DataTypes {
    struct ChallengeParams {
        uint startedTimestamp;
        uint finishTimestamp;
    }

    struct ChallengeStreamParams {
        uint startedTimestamp;
        uint finishedTimestamp;
        address authorAddress;
        string description;
        string extraDataURI;
    }

    struct ChallengeStreamerParams {
        address accountAddress;
        uint successfulStreams;
    }
}
