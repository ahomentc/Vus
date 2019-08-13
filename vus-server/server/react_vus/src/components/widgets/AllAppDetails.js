import React from "react";
import { Container, Row, Col, Button, badge } from "react-bootstrap";
import Cookies from "universal-cookie";
import DjangoCSRFToken from "django-react-csrftoken";
import axios from "axios";
import ReactStars from "react-stars";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Slider from "react-slick";

import styles from "./allappdetails.module.css";
import ReactHtmlParser from "react-html-parser";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

//var host = "http://127.0.0.1:8000";
var host = "http://128.195.53.189:3002";

function AllAppDetails(props) {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false
  };
  return (
    <Container>
      <Row style={{ paddingTop: "15px" }}>
        <Col xs={12} sm={9} style={{ paddingLeft: "30px" }}>
          <h3 className={styles.titleFont}> {props.title}</h3>
          <h5 className={styles.subtitleFont}>{props.subtitle}</h5>
        </Col>
        <Col xs={12} sm={3}>
          <Button
            onClick={props.onClick}
            variant="primary"
            className={styles.addToCart}
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
      <Row>
        <hr className={styles.titleHr} />
      </Row>
      <Row>
        <Col>
          <Slider {...settings}>
            {props.images.map((value, index) => {
              return (
                <div>
                  <img
                    src={value}
                    alt="First slide"
                    className={styles.imageSlider}
                  />
                </div>
              );
            })}
          </Slider>
        </Col>
      </Row>

      <Row style={{ padding: "15px" }}>
        <p className={styles.descriptionFont}>
          {ReactHtmlParser(props.description)}
        </p>
      </Row>
      <hr />
      <Container style={{ padding: "15px" }}>
        <h3 className={styles.informationFont}>Information</h3>
        <Row className="justify-content-md-center">
          <Col xs lg="2">
            <h5 className={styles.developersFont}>Developers </h5>
          </Col>
          <Col xs lg="7">
            <ul className={styles.menuUl}>
              {props.developers.map((value, index) => {
                return <li className={styles.menuLi}> {value.name}, </li>;
              })}
            </ul>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col xs lg="2">
            <h5 className={styles.dependenciesFont}>Dependencies</h5>
          </Col>
          <Col xs lg="7">
            <ul className={styles.menuUl}>
              {props.dependencies.map((value, index) => {
                return <li className={styles.menuLi}> {value.name}, </li>;
              })}
            </ul>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col xs lg="2">
            <h5 className={styles.sizeFont}>Size</h5>
          </Col>
          <Col xs lg="7">
            <ul className={styles.menuUl}>
              <li className={styles.menuLi}>{props.size} MB</li>
            </ul>
          </Col>
        </Row>
      </Container>
      <hr />
    </Container>
  );
}

export default AllAppDetails;
