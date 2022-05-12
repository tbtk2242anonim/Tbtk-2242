const { expect } = require("chai"); 

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("BazaarTest", function () {

  let Productfactory;
  let product;
  let Bazaarfactory;
  let bazaar
  let admin;
  let addr1;
  let addr2;
  let URI = "empty"

  beforeEach(async function () {
    Productfactory = await ethers.getContractFactory("Product");
    Bazaarfactory = await ethers.getContractFactory("Bazaar");
    [admin, addr1, addr2, ...addrs] = await ethers.getSigners();
    product = await Productfactory.deploy();
    bazaar = await Bazaarfactory.deploy();
  });
  describe("Deployment", function () {
    it("name and symbol controlling", async function () {
      const Name = "1Bazaar-TR"
      const Symbol = "1BTR"
      expect(await product.name()).to.equal(Name);
      expect(await product.symbol()).to.equal(Symbol);
    });

    it("Admin address check", async function () {
      expect(await bazaar.admin()).to.equal(admin.address);
    });
  });

  describe("Minting NFTs", function () {

    it("NFTs miting state", async function () {
      
      await product.connect(addr1).mint(URI)
      expect(await product.ProductID()).to.equal(1);
      expect(await product.balanceOf(addr1.address)).to.equal(1);
      expect(await product.tokenURI(1)).to.equal(URI);
      
      await product.connect(addr2).mint(URI)
      expect(await product.ProductID()).to.equal(2);
      expect(await product.balanceOf(addr2.address)).to.equal(1);
      expect(await product.tokenURI(2)).to.equal(URI);
    });
  })
 

  describe("Listing items using createListing method", function () {
    let price = 1
     
    beforeEach(async function () {
      await product.connect(addr1).mint(URI)
      await product.connect(addr1).setApprovalForAll(bazaar.address, true)
    })
    it("createListing functions works", async function () {
      await expect(bazaar.connect(addr1).createListing(product.address, 1 , toWei(price), 1, "kg"))
        .to.emit(bazaar, "Listing")
        .withArgs(
          1,
          product.address,
          1,
          1,
          "kg",
          toWei(price),
          addr1.address,
          true
        )
      expect(await product.ownerOf(1)).to.equal(bazaar.address);
      expect(await bazaar.BazaarCount()).to.equal(1)
      const item = await bazaar.BazaarList(1)
      expect(item.listingID).to.equal(1)
      expect(item.product).to.equal(product.address)
      expect(item.ProductID).to.equal(1)
      expect(item.price).to.equal(toWei(price))
      
    });

  });



  describe("Purchasing Bazaaritems", function () {
    let price = 1
    let donus
    beforeEach(async function () {
      // addr1 mints an nft
      await product.connect(addr1).mint(URI)
      // addr1 approves marketplace to spend tokens
      await product.connect(addr1).setApprovalForAll(bazaar.address, true)
      // addr1 makes their nft a marketplace item.
      await bazaar.connect(addr1).createListing(product.address, 1 , toWei(price), 1, "kg")
    })
    it("purchaseBazaarItem function works", async function () {
      // addr 2 purchases item.
      
      await expect(bazaar.connect(addr2).purchaseBazaarItem(1, {value: toWei(price)}))
      .to.emit(bazaar, "sold")
        .withArgs(
          1,
          product.address,
          1,
          1,
          "kg",
          toWei(price),
          addr1.address,
          addr2.address,
          false,
          false
        )

      // fails for invalid item ids
      await expect(await bazaar.connect(addr2).confirmBuyer(1))

      const sellerInitalEthBal = await addr1.getBalance()
      const buyerInitialEthBal = await addr2.getBalance()
      await expect(bazaar.connect(addr1).confirmProducer(1))
      

      const sellerFinalEthBal = toWei(await addr1.getBalance())
      const buyerFinalEthBal = toWei(await addr2.getBalance())
  
      expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
      //expect(+fromWei(buyerInitialEthBal)).to.equal(+price + +fromWei(buyerFinalEthBal))

      expect(await product.ownerOf(1)).to.equal(addr2.address);
    })
    
  })

})