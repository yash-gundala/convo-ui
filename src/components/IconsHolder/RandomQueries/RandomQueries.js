import React, { useState, useEffect } from 'react';
import styles from './RandomQueries.module.css'; // You'll need to create this CSS module

const queries = [
  "Tell me about AMD Instinct™ MI300 Series Accelerators",
  "What is the best AMD EPYC for databases?",
  "What is the best AMD EPYC for CI/CD?",
  "Which AMD EPYC has highest frequency?",
  "Which AMD EPYC is best for finance and banking?",
  "What is best AMD EPYC for low latency applications?",
  "What is best AMD EPYC for MongoDB",
  "What areas latest 4th Gen AMD EPYC is better than Intel Xeon",
  "Where can I find AMD EPYC GCC tool support",
  "Where to find latest AMD EPYC related security patches",
  "How AMD EPYC helping climate",
  "How AMD EPYC 4th Gen compares to competition",
  "What are the best features of latest 4th Gen EPYC",
  "What is specification for latest 4th Gen EPYC",
];

const getRandomQueries = (arr, n) => {
  let shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const RandomQueries = ({ onQuerySelect }) => {
  const [randomQueries, setRandomQueries] = useState([]);

  useEffect(() => {
    setRandomQueries(getRandomQueries(queries, 3));
  }, []);

  return (
<>
    <div
    style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <h1
      style={{ fontSize: "60px", color: "#3B82F6", userSelect: 'none' }}
    >
      {" "}
      ConvoGene
    </h1>
  </div>

  <div
    style={{
      marginTop: "10%",
      height: "60%",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      alignItems: "center",
    }}
  >
    {randomQueries.map((query, index) => (
      <div className={styles.promptCustom}>
        <p
          key={index}
          onClick={() => {
            onQuerySelect(query);
          }}
          className={styles.subtext}
        >
          {query}
        </p>
      </div>
    ))}
  </div>
</>
  );
};

export default RandomQueries;