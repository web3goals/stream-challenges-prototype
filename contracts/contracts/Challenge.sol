// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Constants.sol";
import "./libraries/Errors.sol";

/**
 * A contract that stores challenges and streams.
 */
contract Challenge is
    ERC721Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;

    event ChallengeStarted(
        uint256 indexed tokenId,
        DataTypes.ChallengeParams params
    );
    event StreamStarted(
        uint256 indexed tokenId,
        address indexed streamAuthorAddress,
        DataTypes.ChallengeStreamParams streamParams
    );
    event StreamFinished(
        uint256 indexed tokenId,
        address indexed streamAuthorAddress,
        DataTypes.ChallengeStreamParams streamParams
    );
    event StreamerAdded(
        address indexed streamerAccountAddress,
        DataTypes.ChallengeStreamerParams streamer
    );
    event StreamerUpdated(
        address indexed streamerAccountAddress,
        DataTypes.ChallengeStreamerParams streamer
    );

    string _imageSVG;
    uint _durationMinutes;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.ChallengeParams) private _params;
    mapping(uint256 => DataTypes.ChallengeStreamParams[]) private _streams;
    DataTypes.ChallengeStreamerParams[] private _streamers;

    function initialize() public initializer {
        __ERC721_init("Stream Challenges - Challenges", "SCC");
        __Ownable_init();
        __Pausable_init();
        _imageSVG = '<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" fill="white"/><path d="M66.5403 113.54C64.9563 113.54 63.3843 113.384 61.8243 113.072C60.2643 112.784 58.9803 112.376 57.9723 111.848V106.124C59.2683 106.796 60.6123 107.3 62.0043 107.636C63.4203 107.972 64.7643 108.14 66.0363 108.14C67.2123 108.14 68.1003 107.96 68.7003 107.6C69.3003 107.24 69.6003 106.724 69.6003 106.052C69.6003 105.548 69.4323 105.116 69.0963 104.756C68.7843 104.372 68.3163 104.024 67.6923 103.712C67.0683 103.4 66.0963 102.968 64.7763 102.416C62.4483 101.432 60.7563 100.34 59.7003 99.14C58.6443 97.94 58.1163 96.464 58.1163 94.712C58.1163 93.272 58.5123 91.988 59.3043 90.86C60.1203 89.732 61.2483 88.856 62.6883 88.232C64.1283 87.608 65.7843 87.296 67.6563 87.296C69.1923 87.296 70.5603 87.416 71.7603 87.656C72.9603 87.896 74.1123 88.28 75.2163 88.808V94.388C73.1043 93.284 70.9803 92.732 68.8443 92.732C67.6923 92.732 66.7683 92.924 66.0723 93.308C65.4003 93.668 65.0643 94.196 65.0643 94.892C65.0643 95.588 65.4123 96.152 66.1083 96.584C66.8043 97.016 68.0883 97.604 69.9603 98.348C71.6643 99.044 72.9843 99.728 73.9203 100.4C74.8803 101.072 75.5763 101.852 76.0083 102.74C76.4403 103.628 76.6563 104.756 76.6563 106.124C76.6563 108.452 75.8043 110.276 74.1003 111.596C72.4203 112.892 69.9003 113.54 66.5403 113.54ZM84.1063 93.2H77.0143V87.836H97.6063V93.2H90.4783V113H84.1063V93.2ZM99.579 87.836H110.883C113.835 87.836 116.139 88.58 117.795 90.068C119.475 91.556 120.315 93.692 120.315 96.476C120.315 98.348 119.907 99.944 119.091 101.264C118.275 102.584 117.123 103.568 115.635 104.216L120.099 113H113.547L109.551 105.116H105.951V113H99.579V87.836ZM109.767 99.752C111.039 99.752 112.023 99.512 112.719 99.032C113.415 98.528 113.763 97.676 113.763 96.476C113.763 95.228 113.415 94.376 112.719 93.92C112.047 93.44 111.063 93.2 109.767 93.2H105.951V99.752H109.767ZM122.852 87.836H140.708V93.2H129.224V97.916H137.612V102.92H129.224V107.636H140.708V113H122.852V87.836ZM152.603 87.836H158.867L168.911 113H162.395L160.379 107.816H151.091L149.075 113H142.523L152.603 87.836ZM158.795 102.92L155.735 94.46L152.639 102.92H158.795ZM170.524 87.836H176.644L183.916 103.424L191.224 87.836H197.308V113H191.368V100.364L185.356 113H182.476L176.5 100.364V113H170.524V87.836ZM28.7273 167.54C25.9913 167.54 23.5793 167.012 21.4913 165.956C19.4273 164.9 17.8313 163.388 16.7033 161.42C15.5753 159.428 15.0113 157.1 15.0113 154.436C15.0113 151.772 15.5753 149.456 16.7033 147.488C17.8313 145.496 19.4273 143.972 21.4913 142.916C23.5793 141.836 25.9913 141.296 28.7273 141.296C30.5273 141.296 32.1353 141.476 33.5513 141.836C34.9673 142.196 36.2753 142.76 37.4753 143.528V149.576C36.4193 148.736 35.2193 148.124 33.8753 147.74C32.5553 147.356 31.0313 147.164 29.3033 147.164C26.8313 147.164 24.9233 147.812 23.5793 149.108C22.2353 150.38 21.5633 152.156 21.5633 154.436C21.5633 156.716 22.2353 158.504 23.5793 159.8C24.9473 161.096 26.8553 161.744 29.3033 161.744C31.0313 161.744 32.5793 161.54 33.9473 161.132C35.3153 160.724 36.5873 160.076 37.7633 159.188V165.2C35.4833 166.76 32.4713 167.54 28.7273 167.54ZM40.2704 141.836H46.6424V151.556H56.5064V141.836H62.8784V167H56.5064V156.848H46.6424V167H40.2704V141.836ZM75.4702 141.836H81.7342L91.7782 167H85.2622L83.2462 161.816H73.9582L71.9422 167H65.3902L75.4702 141.836ZM81.6622 156.92L78.6022 148.46L75.5062 156.92H81.6622ZM94.3055 141.836H100.678V161.636H111.622V167H94.3055V141.836ZM113.431 141.836H119.803V161.636H130.747V167H113.431V141.836ZM132.028 141.836H149.884V147.2H138.4V151.916H146.788V156.92H138.4V161.636H149.884V167H132.028V141.836ZM152.419 141.836H158.719L167.971 156.812V141.836H174.343V167H168.079L158.791 151.988V167H152.419V141.836ZM190.587 167.54C187.851 167.54 185.439 167.012 183.351 165.956C181.287 164.9 179.691 163.388 178.563 161.42C177.435 159.428 176.871 157.1 176.871 154.436C176.871 151.772 177.435 149.456 178.563 147.488C179.691 145.496 181.287 143.972 183.351 142.916C185.439 141.836 187.851 141.296 190.587 141.296C192.411 141.296 194.019 141.476 195.411 141.836C196.827 142.172 198.135 142.724 199.335 143.492V149.54C198.279 148.7 197.079 148.1 195.735 147.74C194.415 147.356 192.891 147.164 191.163 147.164C189.675 147.164 188.343 147.464 187.167 148.064C186.015 148.64 185.103 149.48 184.431 150.584C183.759 151.688 183.423 152.972 183.423 154.436C183.423 156.716 184.083 158.516 185.403 159.836C186.747 161.156 188.559 161.816 190.839 161.816C192.111 161.816 193.179 161.6 194.043 161.168V157.136H190.191V152.672H200.091V165.2C197.523 166.76 194.355 167.54 190.587 167.54ZM202.622 141.836H220.478V147.2H208.994V151.916H217.382V156.92H208.994V161.636H220.478V167H202.622V141.836ZM230.861 167.54C229.277 167.54 227.705 167.384 226.145 167.072C224.585 166.784 223.301 166.376 222.293 165.848V160.124C223.589 160.796 224.933 161.3 226.325 161.636C227.741 161.972 229.085 162.14 230.357 162.14C231.533 162.14 232.421 161.96 233.021 161.6C233.621 161.24 233.921 160.724 233.921 160.052C233.921 159.548 233.753 159.116 233.417 158.756C233.105 158.372 232.637 158.024 232.013 157.712C231.389 157.4 230.417 156.968 229.097 156.416C226.769 155.432 225.077 154.34 224.021 153.14C222.965 151.94 222.437 150.464 222.437 148.712C222.437 147.272 222.833 145.988 223.625 144.86C224.441 143.732 225.569 142.856 227.009 142.232C228.449 141.608 230.105 141.296 231.977 141.296C233.513 141.296 234.881 141.416 236.081 141.656C237.281 141.896 238.433 142.28 239.537 142.808V148.388C237.425 147.284 235.301 146.732 233.165 146.732C232.013 146.732 231.089 146.924 230.393 147.308C229.721 147.668 229.385 148.196 229.385 148.892C229.385 149.588 229.733 150.152 230.429 150.584C231.125 151.016 232.409 151.604 234.281 152.348C235.985 153.044 237.305 153.728 238.241 154.4C239.201 155.072 239.897 155.852 240.329 156.74C240.761 157.628 240.977 158.756 240.977 160.124C240.977 162.452 240.125 164.276 238.421 165.596C236.741 166.892 234.221 167.54 230.861 167.54Z" fill="black"/></svg>';
        _durationMinutes = 20;
    }

    /// ***************************
    /// ***** OWNER FUNCTIONS *****
    /// ***************************

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setImageSVG(string memory imageSVG) public onlyOwner {
        _imageSVG = imageSVG;
    }

    function setDurationMinutes(uint durationMinutes) public onlyOwner {
        _durationMinutes = durationMinutes;
    }

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    function startChallenge() public whenNotPaused {
        // Check data
        if (!_isLastChallengeFinished()) {
            revert(Errors.LAST_CHALLENGE_NOT_FINISHED);
        }
        // Update counter
        _counter.increment();
        // Mint token
        uint256 newTokenId = _counter.current();
        _mint(msg.sender, newTokenId);
        // Set params
        DataTypes.ChallengeParams memory params = DataTypes.ChallengeParams(
            block.timestamp,
            block.timestamp + _durationMinutes * Constants.SECONDS_PER_MINUTE
        );
        _params[newTokenId] = params;
        emit ChallengeStarted(newTokenId, params);
    }

    function startStream(
        string memory identifier,
        string memory description
    ) public whenNotPaused {
        // Check data
        if (_isLastChallengeFinished()) {
            revert(Errors.LAST_CHALLENGE_FINISHED);
        }
        DataTypes.ChallengeStreamParams
            memory stream = _getLastChallengeStreamByAuthorAddress(msg.sender);
        if (stream.startedTimestamp != 0) {
            revert(Errors.STREAM_ALREADY_STARTED);
        }
        // Add stream
        stream = DataTypes.ChallengeStreamParams(
            block.timestamp,
            0,
            identifier,
            msg.sender,
            description,
            ""
        );
        _streams[_counter.current()].push(stream);
        emit StreamStarted(_counter.current(), stream.authorAddress, stream);
        // Add streamer if not exists
        if (!_isStreamerExists(msg.sender)) {
            DataTypes.ChallengeStreamerParams memory streamer = DataTypes
                .ChallengeStreamerParams(stream.authorAddress, 0);
            _streamers.push(streamer);
            emit StreamerAdded(streamer.accountAddress, streamer);
        }
    }

    function finishStream(string memory extraDataUri) public whenNotPaused {
        // Check data
        if (_isLastChallengeFinished()) {
            revert(Errors.LAST_CHALLENGE_FINISHED);
        }
        DataTypes.ChallengeStreamParams
            memory stream = _getLastChallengeStreamByAuthorAddress(msg.sender);
        if (stream.startedTimestamp == 0) {
            revert(Errors.STREAM_NOT_STARTED);
        }
        if (stream.finishedTimestamp != 0) {
            revert(Errors.STREAM_ALREADY_FINISHED);
        }
        // Update stream
        for (uint i = 0; i < _streams[_counter.current()].length; i++) {
            if (_streams[_counter.current()][i].authorAddress == msg.sender) {
                _streams[_counter.current()][i].finishedTimestamp = block
                    .timestamp;
                _streams[_counter.current()][i].extraDataURI = extraDataUri;
                emit StreamFinished(
                    _counter.current(),
                    _streams[_counter.current()][i].authorAddress,
                    _streams[_counter.current()][i]
                );
            }
        }
        // Update streamer
        for (uint i = 0; i < _streamers.length; i++) {
            if (_streamers[i].accountAddress == stream.authorAddress) {
                _streamers[i].successfulStreams++;
                emit StreamerUpdated(
                    _streamers[i].accountAddress,
                    _streamers[i]
                );
            }
        }
    }

    /// *********************************
    /// ***** PUBLIC VIEW FUNCTIONS *****
    /// *********************************

    function getImageSVG() public view returns (string memory) {
        return _imageSVG;
    }

    function getDurationMinutes() public view returns (uint) {
        return _durationMinutes;
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getParams(
        uint256 tokenId
    ) public view returns (DataTypes.ChallengeParams memory) {
        return _params[tokenId];
    }

    function getLastChallenge()
        public
        view
        returns (DataTypes.ChallengeParams memory)
    {
        return _params[_counter.current()];
    }

    function getLastChallengeStreamByAuthorAddress(
        address authorAddress
    ) public view returns (DataTypes.ChallengeStreamParams memory) {
        return _getLastChallengeStreamByAuthorAddress(authorAddress);
    }

    function getLastChallengeStreams()
        public
        view
        returns (DataTypes.ChallengeStreamParams[] memory)
    {
        return _streams[_counter.current()];
    }

    function getStreamers()
        public
        view
        returns (DataTypes.ChallengeStreamerParams[] memory)
    {
        return _streamers;
    }

    function isLastChallengeFinished() public view returns (bool) {
        return _isLastChallengeFinished();
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":"Stream Challenges - Challenge #',
                            Strings.toString(tokenId),
                            '","image":"data:image/svg+xml;base64,',
                            Base64.encode(abi.encodePacked(_imageSVG)),
                            '","attributes":[{"trait_type":"id","value":"',
                            Strings.toString(tokenId),
                            '"}]}'
                        )
                    )
                )
            );
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _isLastChallengeFinished() internal view returns (bool) {
        return block.timestamp > _params[_counter.current()].finishTimestamp;
    }

    function _getLastChallengeStreamByAuthorAddress(
        address authorAddress
    ) internal view returns (DataTypes.ChallengeStreamParams memory) {
        for (uint i = 0; i < _streams[_counter.current()].length; i++) {
            if (
                _streams[_counter.current()][i].authorAddress == authorAddress
            ) {
                return _streams[_counter.current()][i];
            }
        }
        DataTypes.ChallengeStreamParams memory stream;
        return stream;
    }

    function _isStreamerExists(
        address accountAddress
    ) internal view returns (bool) {
        for (uint i = 0; i < _streamers.length; i++) {
            if (_streamers[i].accountAddress == accountAddress) {
                return true;
            }
        }
        return false;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        if (from != address(0)) revert(Errors.TOKEN_NOT_TRANSFERABLE);
    }
}
