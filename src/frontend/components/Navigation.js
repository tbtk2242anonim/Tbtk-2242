import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container, NavbarBrand } from "react-bootstrap";

const Navigation = ({ metamask, account, admin, role}) => {
  
  const getRole = (role) => {
    switch(role) {
      case 0 :
        return 'Not Registered';
      case 1 :
        return 'Producer';
      case 2 :
        return 'Buyer';
      case 3 :
        return 'Producer & Buyer';
      default:
        return 'Error';
    }
  };

  return (
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <Container class="container">
        <NavbarBrand href="/">&nbsp; Bazaar-TR</NavbarBrand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <nav class="me-auto navbar-nav">
            <Nav.Link as={Link} class="nav-link active" aria-current="page" to="/"> Home </Nav.Link>
            {admin === account ? (<Nav.Link as={Link} class="nav-link" to="/authorize"> Authorize </Nav.Link>) : null }
            {role === 1 || role === 3 ? (<Nav.Link as={Link} class="nav-link" to="/create"> Create Listing </Nav.Link>) : null}
            {role === 1 || role === 3 ? (<Nav.Link as={Link} class="nav-link" to="/my-listed-items"> My Listed Items </Nav.Link>) : null}
            {role !== ''&& role !== 0 ? (<Nav.Link as={Link} class="nav-link" to="/approvement"> My Approvements </Nav.Link>) : null}
            {role === 1 || role === 3 ? (<Nav.Link as={Link} class="nav-link" to="/sells">My Sells </Nav.Link>) : null}
            {role === 2 || role === 3 ? (<Nav.Link as={Link} class="nav-link" to="/purchases"> My Purchases </Nav.Link>):null}s
          </nav>
          <nav class="ms-auto navbar-nav">
            {account ? (
              <a
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button nav-button btn-sm mx-4"
              >
                <Button variant="outline-light">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </Button>
                <Button disabled = {(role === 0) ? true : false} variant="outline-light ms-2"> Your Role: 
                {account === admin ? (" Admin") : getRole(role) }
                </Button>
              </a>
            ) : (
              <Button onClick={metamask} variant="outline-light">
                Connect Wallet
              </Button>
            )}
          </nav>
        </Navbar.Collapse>
      </Container>
    </nav>
  );
};

export default Navigation;
