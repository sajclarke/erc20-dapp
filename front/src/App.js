import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from "reactstrap";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import Web3 from "web3";

// Import contract
import TutorialToken from "./contracts/TutorialToken.json";

import logo from "./logo.svg";
// import './App.css';
import { setInterval } from "timers";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: null,
      web3: null,
      errorMsg: "",
      transferForm: {
        amount: 0,
        address: ""
      }
    };
  }

  componentDidMount = async () => {
    setInterval(async () => {
      try {
        //Does the browser provide access to web3? (this is provided via Metamask in my case)
        if (typeof window.web3 !== undefined) {
          //Access Metamask wallet and information
          const web3 = new Web3(Web3.givenProvider);

          const accounts = await web3.eth.getAccounts(); //account[0] is default

          if (accounts.length < 1) {
            // console.log('Could not connect to Metamask. Please unlock your metamask')
            this.setState({
              errorMsg:
                "Could not connect to Metamask. Please unlock your metamask"
            });
          } else {
            this.setState({ account: accounts[0] });
            this.getBalance(web3);
          }
        } else {
          // console.log('web3 not detected')
          this.setState({ errorMsg: "web3 not detected" });
        }
      } catch (error) {
        this.setState({ errorMsg: "Could not detect web3" });
      }
    }, 1000);
  };

  getBalance = async web3 => {
    //Get logged in MetaMask ETH address
    const accounts = await web3.eth.getAccounts();
    //Instantiate the polyToken smart contract
    //***TODO: Grab deployed contract address from commandline */
    const tutorialInstance = new web3.eth.Contract(
      TutorialToken.abi,
      "0x99E160adc01ca1E969b846a5897f3cb218A0900C"
    );
    //Get account's POLY balance
    const ttBalance = await tutorialInstance.methods
      .balanceOf(accounts[0])
      .call({ from: accounts[0] });
    // console.log(ttBalance)
    // tutorialInstance.methods.decimals().call({ from: accounts[0] }).then((result) => {
    //   console.log(result);
    // });
    const decimals = await tutorialInstance.methods
      .decimals()
      .call({ from: accounts[0] });
    // console.log(decimals)

    // console.log(tutorialInstance)
    //We use web3.utils.fromWei to display the units of the balance from wei to ether
    this.setState({
      loading: false,
      web3: web3,
      account: accounts[0],
      decimals: decimals,
      balance: web3.utils.fromWei(ttBalance, "ether"),
      contractInstance: tutorialInstance
    });
  };

  handleFieldChange = event => {
    event.persist();

    this.setState(prevState => {
      return {
        transferForm: {
          ...prevState.transferForm,
          [event.target.name]: event.target.value
        }
      };
    });
  };

  handleTransfer = e => {
    e.preventDefault();
    const {
      account,
      balance,
      errorMsg,
      transferForm,
      contractInstance,
      decimals,
      web3
    } = this.state;

    if (transferForm.account < 1) {
      return;
    }

    // console.log(transferForm)
    // console.log(contractInstance)

    contractInstance.methods
      .transfer(
        transferForm.address,
        web3.utils.toWei(transferForm.amount, "ether")
      )
      .send({ from: account, gas: 1000000 })
      .then(result => {
        console.log(result);

        this.setState({
          transferForm: {
            amount: 0,
            address: ""
          }
        });
      });
  };

  render() {
    const { account, balance, errorMsg, transferForm } = this.state;
    // const account = this.state.account
    // const errorMsg = this.state.errorMsg
    // console.log(transferForm)

    return (
      <div className="App">
        <Navbar color="dark" dark expand="md">
          <NavbarBrand href="/">Learn ETH</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="#">{account}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">{balance}</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <header className="App-header">
          {/* errorMsg is a string then I can use methods like 'length' */}
          {/* if(errorMsg.length > 0){

        }else{

        } */}

          {/* {condition ? true: false} */}
          {errorMsg.length > 0 ? (
            <p>{errorMsg}</p>
          ) : (
            <div style={{ textAlign: "left" }}>
              {/* <p>Balance is {balance} TT</p> */}

              <Card>
                <CardBody>
                  <Form onSubmit={e => this.handleTransfer(e)}>
                    <FormGroup>
                      <Label for="transferAmount">Amount</Label>
                      <Input
                        type="text"
                        name="amount"
                        value={transferForm.amount}
                        onChange={e => this.handleFieldChange(e)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="transferAddress">Address</Label>
                      <Input
                        type="text"
                        name="address"
                        value={transferForm.address}
                        onChange={e => this.handleFieldChange(e)}
                      />
                    </FormGroup>
                    <Button color="primary" type="submit">
                      Transfer
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </div>
          )}
        </header>
      </div>
    );
  }
}

export default App;
