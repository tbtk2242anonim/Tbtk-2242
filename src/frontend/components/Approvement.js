import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card,Button } from 'react-bootstrap'
import Countdown from 'react-countdown'

export default function Approvement({ bazaar, product, account }) {
    const [loadingpage, setLoading] = useState(true)
    const [ApprovmentList, setApprovmentList] = useState([])
    const [key, setKey] = useState(null)
    const [wrong, setWrong] = useState(false);
    

    const loadListedItems = async () => {
      const BazaarCount = await bazaar.BazaarCount();
      let ApprovmentList = []
      
      for (let i = 1; i <= BazaarCount; i++) {
        const bazaarProduct = await bazaar.BazaarList(i)

        if (bazaarProduct.activty === 2){
        if (bazaarProduct.producer.toLowerCase() === account || bazaarProduct.buyer.toLowerCase() === account) {
          
          const dataUri = await product.tokenURI(bazaarProduct.ProductID);
          const fetchRes = await fetch(dataUri);
          const metaData = await fetchRes.json();
          const lAddress = await bazaar.AuthAddress(bazaarProduct.buyer);
          
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
              buyerApprove: bazaarProduct.buyerConf,
              buyTime: parseInt(bazaarProduct.buyTime),
              key:bazaarProduct.key,
              Locationaddress : lAddress
          }
          ApprovmentList.push(item)
        }
        }
      }
      setLoading(false)
      setApprovmentList(ApprovmentList)
    }
    
    const ifNotApproved = async(bazaarProduct) => {
      try{
      if(Date.now()/1000 < bazaarProduct.buyTime) return;
      if (bazaarProduct.producer.toLowerCase() === account || bazaarProduct.buyer.toLowerCase() === account) {
        await (
          await bazaar.giveBack(bazaarProduct.listingID)
        ).wait();

        loadListedItems();   
      }
      }catch(e){
          console.log("Timer Hatası : ", e)
      }
    }
  
    const approval = async (bazaarProduct,_key) => {
      try {
        await (
          await bazaar.confirmBuyer(bazaarProduct.listingID,_key)
        ).wait();
        setWrong(false);
        loadListedItems();
        
      } catch (e) {
        setWrong(true);
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
        {ApprovmentList.length > 0 ?
          <div className="pxListedItems-5 py-3 container">
              <h2 class=" mt-4">Products Requiring Approval</h2>
              {wrong ? (
                  <div class="mt-4 alert alert-danger App" role="alert">
                    Code Wrong ! Please check the code again.
                  </div>
                ) : (
                  null
                )}
              <Row xs={2} md={3} lg={5} className="g-4 py-2">
              {ApprovmentList.map(item => (
                
                <Col key={item.listingID} className="overflow-hidden">
                <Card class="App border border-dark rounded" >
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body>

                      <h2 class="App">{item.name}</h2>
                      <Card.Text class="App">
                        <hr/>
                        {item.description}
                      </Card.Text>
                      <h3 class="App">
                        {item.amount*1}-{item.amountType}
                      </h3>

                      {(item.producer.toLowerCase() === account) ? (
                            <div>
                              <hr/>
                                <p class= "App">Delivery Address: {item.Locationaddress}</p>
                              <hr/>
                            </div>
                          ):(null)}

                      <p class="App pt-2 pb-0 mb-0">
                        Remaining Time: <Countdown onComplete={()=>(ifNotApproved(item))} date={(item.buyTime)*1000+1000}>
                        <div>
                        <p>The time has expired. Product delivery not confirmed in time. Get the {item.producer.toLowerCase() === account ? "Item Back":"Payback"}!</p>
                        <Button variant="outline-dark mt-2" onClick={() => ifNotApproved(item)} size="lg">
                             {item.producer.toLowerCase() === account ? "Get Item Back":"Payback"}
                        </Button>
                        </div>
                        </Countdown>
                      </p>

                      </Card.Body>

                    <Card.Footer>
                    {(item.producer.toLowerCase() === account) ? (
                            <div className='App'>
                              <h5>
                                Code: {parseInt(item.key)}
                              </h5>
                            </div>
                          ):(null)
                    }

                    {(item.buyer.toLowerCase() === account) ? (
                      
                        (item.buyerApprove === false) ?
                          (
                            <div class ="App">
                              <input onChange={(e) => setKey(e.target.value)}  class="form-control form-control-lg mb-1 App" required type="text" placeholder="Key"></input>
                              <Button variant="outline-dark mt-1" onClick={() => approval(item,key)} size="lg">
                                  Confirm
                              </Button>
                            </div>
                        ):(
                            null
                          )
                          ):(null)
                    }
                    </Card.Footer>
                </Card> 
                </Col> ))}
            </Row>
          </div>
          : (
            <div class="d-flex justify-content-center align-items-center my-5">
              <h1>You don't have any Approvement.</h1>
            </div>
          )}
      </div>
    );

}