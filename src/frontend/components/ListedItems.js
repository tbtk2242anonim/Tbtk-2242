import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card,Button } from 'react-bootstrap'

function allSoldItems(ListedItems) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={2} md={3} lg={5} className="g-4 py-5">
            {ListedItems.map(item => (
              <Col key={item.listingID} className="overflow-hidden">
              <Card class="App border border-dark rounded" >
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <h2 class="App">{item.name}</h2>
                    <Card.Text class="App">
                      <hr></hr>
                      {item.description}
                    </Card.Text>
                    <h3 class="App">
                      {item.amount*1}-{item.amountType}
                    </h3>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <h2 variant="outline-light"  size="lg">
                        Sold For {ethers.utils.formatEther(item.price)} ETH
                      </h2>
                    </div>
                  </Card.Footer>
              </Card> 
              </Col> ))}
          </Row>
    </>
  )
}

export default function ListedItems({ bazaar, product, account }) {
  const [loadingpage, setLoading] = useState(true)
  const [ListedItems, setListing] = useState([])
  const [soldItems, setSoldItems] = useState([])
  const [itemLocked, setItemLocked] = useState([])

  const loadListedItems = async () => {
    const BazaarCount = await bazaar.BazaarCount();
    let listedItems = []
    let soldItems = []
    let itemLocked = []
    for (let i = 1; i <= BazaarCount; i++) {
      const bazaarProduct = await bazaar.BazaarList(i)
      if (bazaarProduct.producer.toLowerCase() === account || bazaarProduct.buyer.toLowerCase() === account) {
       
        const dataUri = await product.tokenURI(bazaarProduct.ProductID);
        const fetchRes = await fetch(dataUri);
        const metaData = await fetchRes.json();
        
        let item = {
            listingID: bazaarProduct.listingID,
            name: metaData.name,
            image: metaData.image,
            description: metaData.description,
            amount: bazaarProduct.amount,
            amountType: bazaarProduct.amountType,
            price: bazaarProduct.price,
            producer: bazaarProduct.producer,
            buyer: bazaarProduct.buyer,
        }
        listedItems.push(item)
        if (bazaarProduct.producerConf && bazaarProduct.buyerConf) soldItems.push(item)
        const lockedItem = await bazaar.Locked(bazaarProduct.ProductID); 
        if (lockedItem) itemLocked.push(item)
      }
    }
    setLoading(false)
    setListing(listedItems)
    setSoldItems(soldItems)
    setItemLocked(itemLocked)
  }

  const approval = async (bazaarProduct) => {
    if (bazaarProduct.producer.toLowerCase() === account) {
      await (
        await bazaar.confirmProducer(bazaarProduct.listingID)
      ).wait();
      loadListedItems();
    }else if (bazaarProduct.buyer.toLowerCase() === account) {
      await (
        await bazaar.confirmBuyer(bazaarProduct.listingID)
      ).wait();
      loadListedItems();
    }
  }

  useEffect(() => {
    loadListedItems()
  }, [])
  
  if (loadingpage)
    return (
        <div class="d-flex justify-content-center align-items-center my-5">
          <div class="spinner-border d-flex my-5" role="status">
            <span class="visually-hidden" />
          </div>
          <strong className="mx-3">Loading wait...</strong>
        </div>
      );

  return (
    <div className="flex justify-center">
      {ListedItems.length > 0 ?
        <div className="pxListedItems-5 py-3 container">
            <h2>Listed Items And Orders</h2>
            <Row xs={2} md={3} lg={5} className="g-4 py-5">
            {ListedItems.map(item => (
              <Col key={item.listingID} className="overflow-hidden">
              <Card class="App border border-dark rounded" >
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <h2 class="App">{item.name}</h2>
                    <Card.Text class="App">
                      <hr></hr>
                      {item.description}
                    </Card.Text>
                    <h3 class="App">
                      {item.amount*1}-{item.amountType}
                    </h3>
                  </Card.Body>
                  <Card.Footer>
                  {itemLocked.map(locked => (item.listingID == locked.listingID ? 
                  <div className='d-grid bg-dark'>
                     <Button variant="outline-light" onClick={() => approval(item)} size="lg">
                        Approve {item.producer.toLowerCase() === account ? "Sell" : "Buy"}
                     </Button>
                  </div>
                    : 
                  <div className='d-grid'>
                    <p class="AppBold" variant="outline-light"  size="lg">
                      Listing For {ethers.utils.formatEther(item.price)} ETH
                    </p>
                  </div>))
                  }
                    
                  </Card.Footer>
              </Card> 
              </Col> ))}
          </Row>
            {soldItems.length > 0 && allSoldItems(soldItems)}
        </div>
        : (
          <div class="d-flex justify-content-center align-items-center my-5">
            <h1>You don't have any listed products.</h1>
          </div>
        )}
    </div>
  );
}