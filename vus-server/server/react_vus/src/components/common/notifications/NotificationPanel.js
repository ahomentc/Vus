import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';

import styles from './../common.module.css';

class NotificationPanel extends React.Component {
  render() {
    const { title, message, children } = this.props;

    return (
      <Jumbotron className={styles.notificationPanel}>
        <h1>{title}</h1>
        <p>{message}</p>
        { children }
      </Jumbotron>
    );
  }
}

export default NotificationPanel;