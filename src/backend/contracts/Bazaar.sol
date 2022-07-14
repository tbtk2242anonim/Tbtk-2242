// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Bazaar {
    address public immutable admin;
    mapping(address => Auth) public AuthList;
    mapping(uint256 => BazaarItem) public BazaarList;
    mapping(uint256 => bool) public Locked;
    mapping(uint256 => bool) public PaymentTrack;
    mapping(address => string) public AuthName;
    uint256 public deliveryTime = 30; // 1 day = 86400 seconds
    
    uint256 public BazaarCount;
    

    enum Auth {
        notRegistered,
        producer,
        buyer,
        both
    }

    enum Active {
        passive,
        active,
        sold,
        delivered,
        burned
    }

    event Listing(
        uint256 listingID,
        address indexed product,
        uint256 ProductID,
        uint256 amount,
        string amountType,
        uint256 price,
        address indexed producer,
        Active activty
    );

    event sold(
        uint256 listingID,
        address indexed product,
        uint256 ProductID,
        uint256 amount,
        string amountType,
        uint256 price,
        address indexed producer,
        address indexed buyer,
        bool producerConf,
        bool buyerConf      
    );

    modifier isLocked(uint256 _productID) {
        require(Locked[_productID] == false);
        _;
    }

    modifier validID(uint256 _listingID) {
        require(_listingID > 0 && _listingID <= BazaarCount, "There is no such item. (ListingID wrong)");
        _;
    }

     modifier zeroAddress(uint256 _listingID) {
        require(_listingID > 0 && _listingID <= BazaarCount, "There is no such item. (ListingID wrong)");
        _;
    }

    struct BazaarItem {
        uint256 listingID;
        IERC721 product;
        uint256 ProductID;
        uint256 amount;
        string amountType;
        uint256 price;
        address payable producer;
        address payable buyer;
        Active activty;
        bool producerConf;
        bool buyerConf;
        uint buyTime;
    }

    constructor() {
        admin = msg.sender;
        AuthList[msg.sender] = Auth.both;
        AuthName[msg.sender] = "Admin";
    }

    function giveAuth(string memory name,address ad, Auth aut ) external returns(Auth){
        require(msg.sender == admin, "You are not authorized ");
        AuthList[ad] = aut;
        AuthName[ad] = name;
        return AuthList[ad]; 
    }

    function createListing(IERC721 _product, uint256 _productID, uint256 _price, uint256 _amount, string memory _amountType) external isLocked(_productID) {
        
        require(AuthList[msg.sender] == Auth.producer || AuthList[msg.sender] == Auth.both, "You are not authorized to use createListing function");
        require(_price > 0 && _amount > 0, "Price and amount must be bigger than 0");
        require(bytes(_amountType).length > 0, "Please Fill the Amount Type.");
        BazaarCount++;
        _product.transferFrom(msg.sender, address(this), _productID);
        BazaarList[BazaarCount] = BazaarItem(
            BazaarCount,
            _product,
            _productID,
            _amount,
            _amountType,
            _price,
            payable(msg.sender),
            payable(address(0)),
            Active.active,
            false,
            false,
            0
        );

        emit Listing(BazaarCount,address(_product),_productID,_amount,_amountType,_price,msg.sender,Active.active);
    }

    function burnItem(uint256 _listingID) external returns(uint256){
        BazaarItem storage item = BazaarList[_listingID];
        if(item.activty == Active.delivered){ require(item.buyer == address(msg.sender));}
        else if(item.activty == Active.passive || item.activty == Active.active){require(item.producer == address(msg.sender));}
        else{require(false, "You are not authorized on this product");}
        item.producer = payable(address(0));
        item.buyer = payable(address(0));
        item.activty = Active.burned;
        return item.ProductID;
    }

    function purchaseBazaarItem (uint _listingID) external validID(_listingID) payable{
        BazaarItem storage item = BazaarList[_listingID];
        require(item.buyer == address(0), "This item already sold");
        require(item.buyer != item.producer, "You can't buy own items");
        require(msg.value >= item.price, "You don't have enough money for these buying");
        require(item.activty == Active.active , "Product is not active for selling now");
        Locked[item.ProductID] = true;
        item.buyer =  payable(msg.sender);   
        item.activty = Active.sold;
        item.buyTime = block.timestamp + deliveryTime;
    }
    
    function delistItem (uint _listingID) external validID(_listingID) {
        BazaarItem storage item = BazaarList[_listingID];
        require(item.buyer == address(0), "This item already sold");
        require(item.producer == msg.sender , "This item is not yours");
        require(item.activty == Active.active , "Product is not active.");   
        item.activty = Active.passive;
    }

    function giveBack(uint _listingID) external validID(_listingID){
        BazaarItem storage item = BazaarList[_listingID];
        require(item.buyer == address(msg.sender) || item.producer == address(msg.sender) || admin == address(msg.sender), "You are not Authorized");
        require(item.buyTime < block.timestamp, "This item has time to be delivered.");
        PaymentTrack[_listingID] = false;
        item.buyer.transfer(item.price);
        item.buyer = payable(address(0));
        item.buyTime = 0;
        item.activty = Active.passive;
        item.producerConf = false;
        item.buyerConf = false;
    }

    function listItem (uint _listingID) external validID(_listingID) {
        BazaarItem storage item = BazaarList[_listingID];
        require(item.buyer == address(0), "This item already sold");
        require(item.producer == msg.sender , "This item is not yours");
        require(item.activty == Active.passive , "Product is not passive.");   
        item.activty = Active.active;
    }

    function confirmProducer(uint _listingID) external validID(_listingID) returns(bool){
        BazaarItem storage item = BazaarList[_listingID];
        require(msg.sender == item.producer , "you are not producer of this item.");
        item.producerConf = true;
        return confirmCheck(_listingID);
    }

    function confirmBuyer(uint _listingID) external validID(_listingID) returns(bool){
        BazaarItem storage item = BazaarList[_listingID];
        require(item.buyer != address(0), "Buyer address error");
        require(msg.sender == item.buyer , "you are not buyer of this item.");
        item.buyerConf = true;
        return confirmCheck(_listingID);
    }

    function confirmCheck(uint _listingID) private validID(_listingID) returns(bool){
        require(PaymentTrack[_listingID] == false, "This order has already been completed.");
        BazaarItem storage item = BazaarList[_listingID];
        if(item.producerConf == true && item.buyerConf == true){
            PaymentTrack[_listingID] = true;
            item.producer.transfer(item.price);
            item.product.transferFrom(address(this), item.buyer, item.ProductID);
            item.activty = Active.delivered;
            emit sold(_listingID, address(item.product), item.ProductID, item.amount, item.amountType, item.price, item.producer, item.buyer, item.producerConf, item.buyerConf);            
            return true;
        }else{
            return false;
            }
        
    }
    
}
