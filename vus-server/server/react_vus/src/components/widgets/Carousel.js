import React from "react";
import { Container, Row, Col, Button, Carousel } from "react-bootstrap";
import styles from "./carousel.module.css";

const ImageCarousel = props => (
  <Carousel>
    <Carousel.Item>
      <img
        className={styles.imageCarousel}
        src={props.image}
        alt="First slide"
      />
    </Carousel.Item>
    <Carousel.Item>
      <img
        className={styles.imageCarousel}
        src="https://i.imgur.com/i9cIltb.png"
      />
    </Carousel.Item>
  </Carousel>
);

export default ImageCarousel;
