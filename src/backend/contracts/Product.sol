// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Product is ERC721URIStorage {
    
    constructor() ERC721("1Bazaar-TR", "1BTR"){}
    
    uint public ProductID; //Also this veriable counts the product count.
    function mint(string memory _dataURI) external returns(uint) {
        ProductID ++;
        _safeMint(msg.sender, ProductID);
        _setTokenURI(ProductID, _dataURI);
        return(ProductID);
    }
}