import React from "react";
import axios from "axios";

import { Container, Row, Col, Button } from "react-bootstrap";
import AppCard from "./components/widgets/AppCard.js";
import Cookies from "universal-cookie";
import { ToastContainer, toast } from "react-toastify";

import Card from 'react-bootstrap/Card';

import styles from "./home.module.css";
import { Link } from "react-router-dom";
import SearchField from "react-search-field";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

var host = "http://127.0.0.1:8000";
// var host = "http://128.195.53.189:3002";


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: []
    };
  }
  componentDidMount() {
    // axios
    //   .get(host + "/api/app/")
    //   .then(res => {
    //     console.log(res);
    //     const apps = res.data.map(obj => obj);
    //     this.setState({ apps: apps });
    //     console.log(this.state.apps);
    //   })
    //   .then(response => {
    //     console.log(JSON.stringify(response));
    //   });
  }


  render() {
    return (
        <Row>
          {this.state.virtual_sensors.map(obj => (
            <Link
              to={{
                pathname: "/appdetails",
                state: {
                  appInfo: obj
                }
              }}
              style={{ color: "inherit", textDecoration: "inherit" }}>
              <Card style={{ width: '18rem', borderWidth:.5, borderColor: '#d6d7da', }}>
                <Card.Img variant="top" src="https://media.istockphoto.com/photos/beautiful-luxury-home-exterior-with-green-grass-and-landscaped-yard-picture-id856794670?k=6&m=856794670&s=612x612&w=0&h=gneLQSj2K6CzxU4r7DG_HUjd00ZMiZnYhYW_R0goPZ4=" />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the bulk of
                    the card's content.
                  </Card.Text>
                  <Button variant="primary">Go somewhere</Button>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </Row>

    );
  }
}

export default Home;
