import { colors, colorsMeaning } from "../../drawing";
import styles from "./Legend.module.css";

//TODO translate legend
export default function Legend() {
  return (
    <div className={styles.legend}>
      <div className={styles.legendContainer}>
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
