import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function Sell({ bazaar, product, account }) {
  const [loadingpage, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  
  const loadPurchasedItems = async () => {  
    
    const filtered = await bazaar.queryFilter(bazaar.filters.sold(null,null,null,null,null,null,account,null,null,null))
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
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          {purchases.length > 0 ? (
            <div>
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Image</th>
                    <th scope="col">Buyer</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={parseInt(p.listingID)}>
                      <th scope="row">{parseInt(p.listingID)}</th>
                      <td>{p.name}</td>
                      <td><a href={p.image}>Show</a></td>
                      <td>{p.buyer}</td>
                      <td>{parseInt(p.amount)}-{p.amountType}</td>
                      <td>{ethers.utils.formatEther(p.price)} ETH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="d-flex justify-content-center align-items-center my-5">
              <h1>You don't have any sold products.</h1>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}