// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BlackSquareNFT is ERC721, Ownable {
    string public constant TOKEN_URI =
        "https://gateway.pinata.cloud/ipfs/QmSPqcpXEdV7DYEcSRWeyNMfVJdfKzaW9LucxCYuVFU3hG";

    uint256 private _nextTokenId = 1;
    mapping(address => bool) private _hasMinted;
    mapping(address => uint256) private _ownerTokenId; // Track tokenId for each owner

    event BlackSquareMinted(address indexed minter, uint256 indexed tokenId);

    constructor() ERC721("BlackSquareNFT", "BSQ") Ownable(msg.sender) {}

    function mint() external {
        require(msg.sender != address(0), "Invalid address");
        require(!_hasMinted[msg.sender], "Already minted");

        uint256 tokenId = _nextTokenId++;
        _hasMinted[msg.sender] = true;
        _ownerTokenId[msg.sender] = tokenId;
        _safeMint(msg.sender, tokenId);

        emit BlackSquareMinted(msg.sender, tokenId);
    }
    
    /**
     * @notice Get the token ID owned by an address
     * @param owner The owner address
     * @return tokenId The token ID owned by the address, or 0 if none
     */
    function getTokenIdByOwner(address owner) external view returns (uint256) {
        uint256 tokenId = _ownerTokenId[owner];
        // Verify that the token still belongs to this owner
        if (tokenId != 0 && ownerOf(tokenId) == owner) {
            return tokenId;
        }
        return 0;
    }
    
    /**
     * @notice Get all token IDs owned by an address (searches through tokens)
     * @param owner The owner address
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        if (balance == 0) {
            return new uint256[](0);
        }
        
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        // Search through tokens (start from 1, go up to _nextTokenId)
        // We'll check up to a reasonable limit (e.g., 1000 tokens)
        uint256 maxCheck = _nextTokenId < 1000 ? _nextTokenId : 1000;
        for (uint256 i = 1; i < maxCheck; i++) {
            // Use _ownerOf which is internal and doesn't revert
            address tokenOwner = _ownerOf(i);
            if (tokenOwner == owner) {
                tokens[index] = i;
                index++;
                if (index >= balance) break;
            }
        }
        
        return tokens;
    }
    
    /**
     * @notice Reset mint status for an address (owner only, for testing)
     * @param account The address to reset
     */
    function resetMintStatus(address account) external onlyOwner {
        _hasMinted[account] = false;
        _ownerTokenId[account] = 0;
    }

    function hasMinted(address account) external view returns (bool) {
        return _hasMinted[account];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return TOKEN_URI;
    }
}

