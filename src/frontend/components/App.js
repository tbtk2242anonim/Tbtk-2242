import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import ProductAbi from "../contractsData/Product.json";
import BazaarAbi from "../contractsData/Bazaar.json"
import ProductAddress from "../contractsData/Product-address.json";
import BazaarAddress from "../contractsData/Bazaar-address.json";
import Navigation from "./Navigation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Authorize from "./Authorize";
import Create from "./Create";
import ListedItems from "./ListedItems";
import Purchase from "./Purchase";
import Home from "./Home";
import Approvement from "./Approvement"
import Sell from "./Sell"

function App() {
  const [account, setAccount] = useState(null);
  const [product, setProduct] = useState({});
  const [bazaar, setBazaar] = useState({});
  const [loadState, setLoadState] = useState(true);
  const [admin, setAdmin] = useState('');
  const [role, setRole] = useState('');

  const Metamask = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    const metamask = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamask.getSigner();

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await Metamask()
    })

  
    deployContracts(signer, accounts[0]);
  };

  

  const deployContracts = async (signer, act1) => {
    const product = new ethers.Contract(
      ProductAddress.address,
      ProductAbi.abi,
      signer
    );

    setProduct(product);
    const bazaar = new ethers.Contract(
      BazaarAddress.address,
      BazaarAbi.abi,
      signer
    );
    
    const admin = await bazaar.admin();
    setAdmin(admin.toLowerCase());
    const role = await bazaar.AuthList(act1);
    setRole(role);
    setBazaar(bazaar);
    setLoadState(false);
  };




  return (
    <BrowserRouter>
      <div>
        <Navigation metamask={Metamask} account={account} admin={admin} role={role}/>
        {loadState ? (
          <div className="d-flex justify-content-center align-items-center my-5"  >
            <div className="spinner-border d-flex my-5" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <strong className='mx-3'>Please, Connect the Metamask...</strong>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home product={product} bazaar={bazaar} account={account} role={role} />} />
            <Route path="/authorize" element={<Authorize product={product} bazaar={bazaar} account={account} admin={admin} />} />
            <Route path="/create" element={<Create  product={product} bazaar={bazaar} role={role}/>} />
            <Route path="/my-listed-items" element={<ListedItems product={product} bazaar={bazaar} account={account}/>} />
            <Route path="/approvement" element={<Approvement product={product} bazaar={bazaar} account={account}/>} />
            <Route path="/purchases" element={<Purchase product={product} bazaar={bazaar} account={account} />} />
            <Route path="/sells" element={<Sell product={product} bazaar={bazaar} account={account} />} />
          </Routes>
        ) }
      </div>
    </BrowserRouter>
  );
}

export default App;
