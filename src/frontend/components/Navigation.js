import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container, NavbarBrand } from "react-bootstrap";
import logo from "./market.png";

const Navigation = ({ metamask, account }) => {
  return (
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <Container class="container">
        <NavbarBrand href="/">
          
          &nbsp; Bazaar-TR
        </NavbarBrand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <nav class="me-auto navbar-nav">
              <Nav.Link as={Link} class="nav-link active" aria-current="page" to="/"> Home </Nav.Link>
              <Nav.Link as={Link} class="nav-link" to="/create"> Create Listing </Nav.Link>
              <Nav.Link as={Link} class="nav-link" to="/my-listed-items"> My Listed Items </Nav.Link>
              <Nav.Link as={Link} class="nav-link" to="/purchases"> My Purchases </Nav.Link>
          </nav>
          <nav class="ms-auto navbar-nav">
            
              { account ? ( 
                <a
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button nav-button btn-sm mx-4"
                >
                <Button variant="outline-light">
                                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                </Button>
              </a>
              ) : (
                  <Button onClick={metamask} variant="outline-light">Connect Wallet</Button> 
              )}
          </nav>
        </Navbar.Collapse>
      </Container>
    </nav>
  );
};

export default Navigation;
