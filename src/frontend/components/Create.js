import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Create = ({ bazaar, product, role }) => {
  const [image, setImage] = useState('')
  const [amount, setAmount] = useState(null)
  const [amountType, setAmountType] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }
  const createAndListing = async () => {
    if (!image || !price || !name || !description || !amount || !amountType) return
    try{
      const result = await client.add(JSON.stringify({image, price, name, description, amount, amountType}))
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    // mint nft 
    await(await product.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await product.ProductID()
    // approve marketplace to spend nft
    await(await product.setApprovalForAll(bazaar.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await bazaar.createListing(product.address, id, listingPrice, amount, amountType)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setAmount(e.target.value)} size="lg" required type="number" placeholder="Amount" />
              <Form.Control onChange={(e) => setAmountType(e.target.value)} size="lg" required as="textarea" placeholder="AmountType" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              
              <div className="d-grid px-0">
                <Button disabled={(role === 0) ? true : false } onClick={createAndListing} variant="outline-dark" size="lg">
                  Create & List Product!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create