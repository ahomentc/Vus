import React from "react";
import axios from "axios";

import { Container, Row, Col, Button } from "react-bootstrap";
import AppCard from "../../widgets/AppCard";
import ImageCarousel from "../../widgets/Carousel";
import Cookies from "universal-cookie";
import { ToastContainer, toast } from "react-toastify";

import styles from "./home.module.css";
import { Link } from "react-router-dom";
import SearchField from "react-search-field";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

//var host = "http://127.0.0.1:8000";
var host = "http://128.195.53.189:3002";

function addToCart(id) {
  const cookies = new Cookies();
  let token = cookies.get("csrftoken");

  // if have no cart, create one
  var tippers_cart_id = cookies.get("tippers_cart_id");
  if (tippers_cart_id) {
    // add the item to the cart
    axios
      .post(
        host + "/content/add_to_cart/",
        { product_id: id, cart_id: tippers_cart_id },
        {
          headers: [{ name: "X_CSRFTOKEN", value: token }]
        }
      )
      .then(res => {
        console.log(res);
      });
  } else {
    axios.get(host + "/content/create_cart/").then(res => {
      const cart_id = res.data;
      // save the cart_id in a cookie
      cookies.set("tippers_cart_id", cart_id, { path: "/" });

      // now add the item to the cart
      axios
        .post(
          host + "/content/add_to_cart/",
          { product_id: id, cart_id: cart_id },
          {
            headers: [{ name: "X_CSRFTOKEN", value: token }]
          }
        )
        .then(res => {
          console.log(res);
        });
    });
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: [],
      domain_models: [],
      sensor_wrappers: [],
      virtual_sensors: [],
      counter: 0
    };
  }
  componentDidMount() {
    axios
      .get(host + "/api/app/")
      .then(res => {
        console.log(res);
        const apps = res.data.map(obj => obj);
        this.setState({ apps: apps });
        console.log(this.state.apps);
      })
      .then(response => {
        console.log(JSON.stringify(response));
      });
    axios
      .get(host + "/api/domain_model/")
      .then(res => {
        console.log(res);
        const domain_models = res.data.map(obj => obj);
        this.setState({ domain_models: domain_models });
        console.log(this.state.domain_models);
      })
      .then(response => {
        console.log(JSON.stringify(response));
      });
    axios
      .get(host + "/api/sensor_wrapper/")
      .then(res => {
        console.log(res);
        const sensor_wrappers = res.data.map(obj => obj);
        this.setState({ sensor_wrappers: sensor_wrappers });
        console.log(this.state.sensor_wrappers);
      })
      .then(response => {
        console.log(JSON.stringify(response));
      });
    axios
      .get(host + "/api/virtual_sensor/")
      .then(res => {
        console.log(res);
        const virtual_sensors = res.data.map(obj => obj);
        this.setState({ virtual_sensors: virtual_sensors });
        console.log(this.state.virtual_sensors);
      })
      .then(response => {
        console.log(JSON.stringify(response));
      });
  }

  handler(id) {
    addToCart(id);
    toast("Added to cart", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  render() {
    return (
      <div className={styles.homepage}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />
        <ImageCarousel image="https://i.imgur.com/VX3nwIv.png" />

        <Container className={styles.contentContainer}>
          <Row style={{ paddingTop: "50px" }}>
            <Col xs={12} sm={{ span: 6, offset: 4 }}>
              <Button
                className={styles.downloadTippers}
                onClick={() => {
                  this.handler(53);
                }}
                variant="primary"
              >
                Download TIPPERS
              </Button>
            </Col>
          </Row>
          <Row style={{ paddingTop: "50px" }}>
            <Col xs={12} md={9}>
              <h2 className={styles.sectionMainTitle}>Top Apps</h2>
              <h4 className={styles.sectionSubTitle}>Download the new hits</h4>
            </Col>
            <Col xs={12} md={3}>
              <Button variant="primary">See More</Button>
            </Col>
          </Row>
          <Row>
            {this.state.apps.map(obj => (
              <Link
                to={{
                  pathname: "/appdetails",
                  state: {
                    appInfo: obj
                  }
                }}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <AppCard
                  image={obj.icon}
                  title={obj.name}
                  subtitle={obj.subheader}
                  rating={obj.rating}
                />
              </Link>
            ))}
          </Row>

          <Row style={{ paddingTop: "50px" }}>
            <Col xs={12} md={9}>
              <h2 className={styles.sectionMainTitle}>Top Domain Models</h2>
              <h4 className={styles.sectionSubTitle}>
                The domain models our users love
              </h4>
            </Col>
            <Col xs={12} md={3}>
              <Link to="/domain">
                <Button variant="primary">See More</Button>
              </Link>
            </Col>
          </Row>
          <Row>
            {this.state.domain_models.map(obj => (
              <Link
                to={{
                  pathname: "/appdetails",
                  state: {
                    appInfo: obj
                  }
                }}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <AppCard
                  image={obj.icon}
                  title={obj.name}
                  subtitle={obj.subheader}
                  rating={obj.rating}
                />
              </Link>
            ))}
          </Row>

          <Row style={{ paddingTop: "50px" }}>
            <Col xs={12} md={9}>
              <h2 className={styles.sectionMainTitle}>Top Sensor Wrappers</h2>
              <h4 className={styles.sectionSubTitle}>
                Get our most popular sensor wrappers
              </h4>
            </Col>
            <Col xs={12} md={3}>
              <Link to="/sensor">
                <Button variant="primary">See More</Button>
              </Link>
            </Col>
          </Row>
          <Row>
            {this.state.sensor_wrappers.map(obj => (
              <Link
                to={{
                  pathname: "/appdetails",
                  state: {
                    appInfo: obj
                  }
                }}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <AppCard
                  image={obj.icon}
                  title={obj.name}
                  subtitle={obj.description}
                  rating={obj.rating}
                />
              </Link>
            ))}
          </Row>

          <Row style={{ paddingTop: "50px" }}>
            <Col xs={12} md={9}>
              <h2 className={styles.sectionMainTitle}>Top Virtual Sensors</h2>
              <h4 className={styles.sectionSubTitle}>
                Get our most popular sensor wrappers
              </h4>
            </Col>
            <Col xs={12} md={3}>
              <Link to="/sensor">
                <Button variant="primary">See More</Button>
              </Link>
            </Col>
          </Row>
          <Row>
            {this.state.virtual_sensors.map(obj => (
              <Link
                to={{
                  pathname: "/appdetails",
                  state: {
                    appInfo: obj
                  }
                }}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <AppCard
                  image={obj.icon}
                  title={obj.name}
                  subtitle={obj.description}
                  rating={obj.rating}
                />
              </Link>
            ))}
          </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
