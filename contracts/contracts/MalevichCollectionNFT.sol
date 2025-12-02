// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MalevichCollectionNFT
 * @notice Collection of Malevich artworks as reward NFTs for staking BlackSquareNFT
 * @dev Supports multiple artwork types (Red Square, White on White, etc.)
 */
contract MalevichCollectionNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Artwork types enum (representing days 1-4)
    enum ArtworkType {
        RedSquare,      // 0 - Day 1 (Red Square)
        WhiteOnWhite,   // 1 - Day 2 (White on White)
        BlackCircle,    // 2 - Day 3 (Black Circle)
        Suprematist     // 3 - Day 4 (Suprematist)
    }
    
    // Mapping from tokenId to artwork type
    mapping(uint256 => ArtworkType) public tokenArtworkType;
    
    // Token URIs for each artwork type
    mapping(ArtworkType => string) public artworkURIs;
    
    // Count of each artwork type minted
    mapping(ArtworkType => uint256) public artworkCount;
    
    event ArtworkMinted(
        address indexed to,
        uint256 indexed tokenId,
        ArtworkType artworkType
    );
    
    constructor(address initialOwner) ERC721("MalevichCollection", "MALV") Ownable(initialOwner) {
        // Initialize token URIs for each artwork type
        // These are base64 encoded JSON with SVG data
        artworkURIs[ArtworkType.RedSquare] = "https://gateway.pinata.cloud/ipfs/QmVFSCPSW27WxZetkmoeSfTR1BRvHY32fcse88KzbFswUx";
        
        artworkURIs[ArtworkType.WhiteOnWhite] = "https://gateway.pinata.cloud/ipfs/QmUzc48fuheNfDuLe3zmCj5c88PwywsN8tYL5Ardzb8WBX";
        
        artworkURIs[ArtworkType.BlackCircle] = "https://gateway.pinata.cloud/ipfs/QmX7m4hmbtezRngHwh5PqePWhNtnCy43cgM3W97nUePgBg";
        
        artworkURIs[ArtworkType.Suprematist] = "https://gateway.pinata.cloud/ipfs/QmXd2oggJZPL3BuVMzMw8vsEqLizjRA4Mw9qjm9qxkbVXZ";
    }
    
    /**
     * @notice Mint a reward NFT of a specific artwork type
     * @dev Only callable by owner (staking contract)
     * @param to Address to mint the NFT to
     * @param artworkType Type of artwork to mint
     * @return tokenId The ID of the newly minted token
     */
    function mintReward(address to, ArtworkType artworkType) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid address");
        
        uint256 tokenId = _nextTokenId++;
        tokenArtworkType[tokenId] = artworkType;
        artworkCount[artworkType]++;
        
        _safeMint(to, tokenId);
        
        emit ArtworkMinted(to, tokenId, artworkType);
        
        return tokenId;
    }
    
    /**
     * @notice Get the artwork type of a token
     * @param tokenId The token ID
     * @return The artwork type
     */
    function getArtworkType(uint256 tokenId) external view returns (ArtworkType) {
        _requireOwned(tokenId);
        return tokenArtworkType[tokenId];
    }
    
    /**
     * @notice Get token URI for a specific token
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return artworkURIs[tokenArtworkType[tokenId]];
    }
    
    /**
     * @notice Update token URI for an artwork type (only owner)
     * @param artworkType The artwork type
     * @param newURI The new URI
     */
    function setArtworkURI(ArtworkType artworkType, string calldata newURI) external onlyOwner {
        artworkURIs[artworkType] = newURI;
    }
}

