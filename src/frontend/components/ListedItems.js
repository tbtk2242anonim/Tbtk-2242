import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card,Button } from 'react-bootstrap'



export default function ListedItems({ bazaar, product, account }) {
  const [loadingpage, setLoading] = useState(true)
  const [activeItems, setActiveItems] = useState([])
  const [passiveItems, setPassiveItems] = useState([]) 

  const loadListedItems = async () => {
    const BazaarCount = await bazaar.BazaarCount();
    let activeItems = []
    let passiveItems = []
    
    
    for (let i = 1; i <= BazaarCount; i++) {
      const bazaarProduct = await bazaar.BazaarList(i)
      if (bazaarProduct.producer.toLowerCase() === account && (bazaarProduct.activty === 0 || bazaarProduct.activty === 1)) {
        
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
            activty: bazaarProduct.activty
        }

        if (bazaarProduct.activty === 1) activeItems.push(item);
        if (bazaarProduct.activty === 0) passiveItems.push(item);
        
      }
    }
    setLoading(false)
    setActiveItems(activeItems)
    setPassiveItems(passiveItems)
    
  }

  function allPassiveItems(DelistedItems) {
    return (
      <div class="py-3 my-4">
        <h1>Your Delisted Items</h1>
        <Row xs={2} md={3} lg={5} className="g-4 py-4">
              {DelistedItems.map(item => (
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
                    <Card.Footer className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    
                       <Button variant="outline-dark px-4 gap-4" onClick={() => listDelist(item)} size="lg">
                          List
                       </Button>
                       <Button variant="outline-danger gap-3" onClick={() => burnItem(item)} size="lg">
                          Delete
                       </Button>
                                     
                    </Card.Footer>
                </Card> 
                </Col> ))}
            </Row>
      </div>
    )
  }

  const listDelist = async (bazaarProduct) => {
    if (bazaarProduct.producer.toLowerCase() === account && bazaarProduct.activty === 1) {
      await (
        await bazaar.delistItem(bazaarProduct.listingID)
      ).wait();
      loadListedItems();
    }else if (bazaarProduct.producer.toLowerCase() === account && bazaarProduct.activty === 0) {
      await (
        await bazaar.listItem(bazaarProduct.listingID)
      ).wait();
      loadListedItems();
    }
  }

  const burnItem = async (bazaarProduct) => {
   try {
      const Id = parseInt(bazaarProduct.listingID);
      const ProductID = parseInt(await (await bazaar.burnItem(Id)).wait());
      const bool = await(await product.burn(ProductID)).wait();
      console.log(bool);
    } catch (error) {}
    loadListedItems();
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
      {activeItems.length > 0 || passiveItems.length > 0 ?
        <div className="pxListedItems-5 py-3 container">
            {activeItems.length > 0 ? (<h1 class = "my-4">Your Listed Items</h1>):null}
            <Row xs={2} md={3} lg={5} className="g-4 py-2">
            {activeItems.map(item => (
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
                  <Card.Footer className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  
                     <Button variant="outline-dark px-4 gap-4" onClick={() => listDelist(item)} size="lg">
                        Delist
                     </Button>
                     <Button variant="outline-danger gap-3" onClick={() => burnItem(item)} size="lg">
                        Delete
                     </Button>
                                   
                  </Card.Footer>
              </Card> 
              </Col> ))}
          </Row>
            {passiveItems.length > 0 && allPassiveItems(passiveItems)}
        </div>
        : (
          <div class="d-flex justify-content-center align-items-center my-5">
            <h1>You don't have any listed products.</h1>
          </div>
        )}
    </div>
  );
}