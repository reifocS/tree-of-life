import { useState } from "react";
import { colors, colorsMeaning } from "../../drawing";
import styles from "./Legend.module.css";

//TODO translate legend
export default function Legend() {
  const [showLegend, setShowLegend] = useState(true);
  return (
    <div className={styles.legend}>
      <div className={styles.legendToggle}>
        <button onClick={() => setShowLegend((prev) => !prev)}>
          {showLegend ? "cacher légende" : "afficher légende"}
        </button>
      </div>
      <div
        className={styles.legendContainer}
        style={{
          display: showLegend ? "flex" : "none",
        }}
      >
        {colors.map((c) => (
          <div key={c} className={styles.legendContent}>
            <div
              className={styles.legendSquare}
              style={{ backgroundColor: c }}
            ></div>
            <div>{colorsMeaning[c]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
