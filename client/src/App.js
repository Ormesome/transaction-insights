import React from "react";
// import ReactDOM from 'react-dom';
import styles from "./App.module.css";
import Transactions from "./components/Transactions/Transactions";

function App() {
  return (
    <div className={styles.container}>
      <Transactions />
    </div>
  );
}

export default App;
