import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUsers,
  faKey
} from "@fortawesome/free-solid-svg-icons";
import ListGroup from "react-bootstrap/ListGroup";

import SidebarHeader from "./SidebarHeader";

import styles from "./sidebar.module.css";

const navButtons = [
  {
    name: "Home",
    route: "",
    icon: <FontAwesomeIcon icon={faHome} />
  },
  {
    name: "Domain Models",
    route: "domain",
    icon: <FontAwesomeIcon icon={faUser} />
  },
  {
    name: "Sensor Wrappers",
    route: "sensor",
    icon: <FontAwesomeIcon icon={faUsers} />
  },
  {
    name: "Services",
    route: "services",
    icon: <FontAwesomeIcon icon={faKey} />
  }
];

class SidebarContent extends React.Component {
  render() {
    return (
      <React.Fragment>
        <SidebarHeader title={"TIPPERS"} subtitle={"TMarketplace"} />
        <ListGroup className={styles.sidebarItems} variant="flush">
          {navButtons.map((button, index) => {
            return (
              <Link key={index} to={button.route} className={styles.routeLinks}>
                <ListGroup.Item className={styles.sidebarItem} action>
                  <div className={styles.sidebarIcon}>{button.icon}</div>
                  {button.name}
                </ListGroup.Item>
              </Link>
            );
          })}
        </ListGroup>
      </React.Fragment>
    );
  }
}

export default SidebarContent;
