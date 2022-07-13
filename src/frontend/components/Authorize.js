import { useState, useEffect } from "react";
import { Row, Form, Button, Table} from "react-bootstrap";

const Authorize = ({ bazaar, product, account, admin }) => {
  const [address, setAdress] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [authList, setAuthList] = useState([]);
  const [nowEmpty, setEmptyFlag] = useState(false);

  useEffect(() => {
    //console.log("updated");
  }, [authList]);
 
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

  const LoadAuth = async () => {

    if (!address) return;
        
    const Qname = await bazaar.AuthName(address);
    const Qrole = await bazaar.AuthList(address);
    
    

    let item = {
      key: authList.length + 1,
      name: Qname,
      address: address,
      role: Qrole,
    };
    
    setAuthList(authList => [...authList, item]);

  };
/*
<div class="alert alert-danger" role="alert">
  A simple danger alert—check it out!
</div>
*/
  

  //0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 3. cüzdan
  const changeAuth = async () => {
      
    if (!address || !name || !role) return setEmptyFlag(true);
    setEmptyFlag(false);
    try {
      const result = await bazaar.giveAuth(name,address, role)
      //console.log("Başarı ile rol atandı: " ,result)
      setAuthList([]);
    } catch (error) {
      console.log("auth error, Auth not gived ", error);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div class="alert alert-info just justify-content-center align-items-center" >
            A simple info alert—check it out!
          </div>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setAdress(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Address"
              />
              <Form.Select
                onChange={(e) => setRole(e.target.value)}
                size="lg"
                placeholder="Role"
              >
                <option value="0">Not Registered</option>
                <option value="1">Producer</option>
                <option value="2">Buyer</option>
                <option value="3">Both(Producer-Buyer)</option>
              </Form.Select>

              <div class="row mx-n2 mx-0 mt-4 px-0">
                <div class="col-md d-grid px-1">
                  <Button
                    onClick={LoadAuth}
                    variant="outline-dark px-0 "
                    size="lg"
                    disabled={admin.toLowerCase() === account ? false : true}
                  >
                    Check Role!
                  </Button>
                </div>
                <div class="col-md d-grid ml-1 px-1">
                  <Button
                    onClick={changeAuth}
                    variant="outline-dark"
                    size="lg"
                    disabled={admin.toLowerCase() === account ? false : true}
                  >
                    Give & Change Auth !
                  </Button>
                </div>
              </div>
            </Row>
          </div>
          {nowEmpty ? (
            <div class="mt-4 alert alert-danger" role="alert">
              Please fill all informations !
            </div>
          ) : (
            <div />
          )}
          <div>
            {authList.length > 0 ? (
              <div>
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Address</th>
                      <th scope="col">Role</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {authList.map((auths) => (
                      <tr key={auths.key}>
                        <th scope="row">{auths.key}</th>
                        <td>{auths.name}</td>
                        <td>{auths.address}</td>
                        {auths.role === 0 ? (
                          <td class="alert alert-danger" role="alert">
                            This user not registered !
                          </td>
                        ) : (
                          <td class="alert alert-success" role="alert">
                            {getRole(auths.role)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Authorize;