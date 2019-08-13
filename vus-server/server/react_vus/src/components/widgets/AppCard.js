import React from "react";
import { Card, Col } from "react-bootstrap";
import ReactStars from "react-stars";

import styles from "./appcard.module.css";

const AppCard = props => (
  <Col xs={12} style={{ padding: "15px" }}>
    <Card className={styles.card}>
      <Card.Img
        variant="top"
        src={props.image}
        style={{ padding: "15px" }}
        className={styles.cardImage}
        height={160}
        width={160}
      />
      <Card.Body>
        <Card.Title
          style={{
            fontSize: "18px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            width: "135px"
          }}
        >
          {props.title}
        </Card.Title>
        <Card.Subtitle
          className="mb-2 text-muted"
          style={{
            overflow: "hidden",
            fontSize: "14px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            width: "135px"
          }}
        >
          {props.subtitle}
        </Card.Subtitle>
        <ReactStars
          count={5}
          value={props.rating}
          onChange={console.log(5)}
          size={15}
          color1={"#E8E8E8"}
          color2={"#616161"}
          edit={false}
        />
      </Card.Body>
    </Card>
  </Col>
);

export default AppCard;
