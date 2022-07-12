import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from 'react-bootstrap';

const Home = ({ bazaar, product , account, role}) => {
  const [loadingpage, setLoading] = useState(true);
  const [ListedItems, setListing] = useState([]);
  

  const LoadingListedItems = async () => {
    let ListedItems = [];
    const BazaarCount = await bazaar.BazaarCount();
    
    
   
    for (let i = 1; i <= BazaarCount; i++) {
      const bazaarProduct = await bazaar.BazaarList(i);
      if (bazaarProduct.active) {
        const dataUri = await product.tokenURI(bazaarProduct.ProductID);
        const fetchRes = await fetch(dataUri);
        const metaData = await fetchRes.json();

        ListedItems.push({
          listingID: bazaarProduct.listingID,
          name: metaData.name,
          image: metaData.image,
          description: metaData.description,
          amount: bazaarProduct.amount,
          amountType: bazaarProduct.amountType,
          price: bazaarProduct.price,
          producer: bazaarProduct.producer,
          buyer: bazaarProduct.buyer,
          active: bazaarProduct.active,
          producerConf: bazaarProduct.producerConf,
          buyerConf: bazaarProduct.buyerConf,
        });
      }
    }
    setListing(ListedItems);
    setLoading(false);
    
  };

  

  const buy = async (bazaarProduct) => {
    await (
      await bazaar.purchaseBazaarItem(bazaarProduct.listingID, { value: bazaarProduct.price })
    ).wait();
    LoadingListedItems();
  };

  useEffect(() => {
    LoadingListedItems();
  }, []);

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
      {ListedItems.length > 0 ? (
        <div class="container">
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
                    <div className='d-grid bg-dark'>
                      <Button class="buybutton" variant="outline-light" onClick={() => buy(item)} size="lg" disabled={((role === 0) || (item.producer.toLowerCase() === account)) ? true : false } > 
                        Buy for {ethers.utils.formatEther(item.price)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
              </Card> 
              </Col> ))}
          </Row>
      </div>
      ) : (
        <div class="d-flex justify-content-center align-items-center my-5">
          <h1>There are no products listed :( </h1>
        </div>
      )}
    </div>
  );
};
export default Home;
