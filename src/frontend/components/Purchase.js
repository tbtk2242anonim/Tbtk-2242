import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function Purchases({ bazaar, product, account }) {
  const [loadingpage, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  
  const loadPurchasedItems = async () => {  
    //console.log(bazaar)
    const filtered = await bazaar.queryFilter(bazaar.filters.sold(null,null,null,null,null,null,null,account,null,null))
    const allpurchases = await Promise.all(filtered.map(async bazaarProduct => {

      bazaarProduct = bazaarProduct.args
   
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
        buyer: bazaarProduct.buyer
    }
      return item
    }))
    setLoading(false)
    setPurchases(allpurchases)
  }
  useEffect(() => {
    loadPurchasedItems()
  }, [])

  if (loadingpage) return (
    <div class="d-flex justify-content-center align-items-center my-5">
      <div class="spinner-border d-flex my-5" role="status">
        <span class="visually-hidden" />
      </div>
      <strong className="mx-3">Loading wait...</strong>
    </div>
  );
  
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={2} md={3} lg={5} className="g-4 py-5">
            {purchases.map(item => (
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
                        You bought for {ethers.utils.formatEther(item.price)} ETH
                      </h2>
                    </div>
                  </Card.Footer>
              </Card> 
              </Col> ))}
          </Row>
        </div>
        : (
            <div class="d-flex justify-content-center align-items-center my-5">
            <h1>You don't have any bought products.</h1>
          </div>
        )}
    </div>
  );
}