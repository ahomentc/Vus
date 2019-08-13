import React from "react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";

import axios from "axios";
import Cookies from "universal-cookie";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faShoppingCart
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import { FormControl } from "react-bootstrap";
import { Button } from "react-bootstrap";

import styles from "./nav.module.css";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

//var host = "http://127.0.0.1:8000";
var host = "http://128.195.53.189:3002";

const RoutedNavbar = withRouter(props => <TippersNavbar {...props} />);

class TippersNavbar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      items: 0
    };
  }

  getPathName(pathname) {
    let currentPage = pathname.split("/")[1];
    currentPage = currentPage != "" ? currentPage : "home";
    return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  }

  componentDidMount() {

  }

  render() {
    const { toggleDockedCallback, location } = this.props;
    return (
      <Navbar bg="dark" variant="dark">
        <Link
          to="/home"
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Navbar.Brand href="/">
            {"  Vus"}
          </Navbar.Brand>
        </Link>
        <Nav className="mr-auto">
          <Link
            to="/home"
            style={{ color: "inherit", textDecoration: "inherit" }}
          >
            <Nav.Link href="/">Home</Nav.Link>
          </Link>

          <Link
            to="/home"
            style={{ color: "inherit", textDecoration: "inherit" }}
          >
            <Nav.Link href="/home">Applications</Nav.Link>
          </Link>
        </Nav>
      </Navbar>
    );
  }
}

export default RoutedNavbar;
