import React from "react";

import styles from "./sidebar.module.css";

import logo from "../../assets/images/Tippers-Dark-Background.png";

class SidebarHeader extends React.Component {
  render() {
    const { title, subtitle } = this.props;

    return (
      <div className={styles.sidebarHeader} style={{ paddingLeft: "30px" }}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    );
  }
}

export default SidebarHeader;
