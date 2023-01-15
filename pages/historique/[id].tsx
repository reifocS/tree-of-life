import { useRouter } from "next/router";
import { Seance } from "../../components/App/CanvasMultiplayer";
import { Model } from "../../components/App/Model";
import RichTextEditor from "../../components/Editor/RichTextEditor";
import LeafIcon from "../../components/LeafIcon";
import useLocalStorage from "../../hooks/useLocalStorage";
import useReadLocalStorage from "../../hooks/useReadLocalStorage";
import styles from "../../styles/Historique.module.css";
const Historique = () => {
  const router = useRouter();
  // treeId
  const { id } = router.query;
  const [seances] = useLocalStorage<Seance>("tof-seance", {});
  const models = useReadLocalStorage<Model[]>("models");
  const histo = Object.entries(seances).filter(([k, v]) => {
    return v.treeId === id;
  });
  const currentModel = models?.find((m) => m.id === id);
  return (
    <div className={styles.Historique}>
      <h1>Historique de l&apos;arbre {currentModel?.name}</h1>
      <div className={styles.Wrapper}>
        {histo.map((h) => (
          <div key={h[0]} className={styles.HistoriqueEntry}>
            <h1>Séance du {new Date(h[1].date).toLocaleDateString()}</h1>
            <label className={styles.Label}>Thèmes abordés</label>
            <ul role="list" className={styles.SeanceActions}>
              {h[1].actions.map((ac) => (
                <li className={styles.SeanceActions} key={ac.leafId}>
                  {ac.leafTitle} : <LeafIcon color={ac.color} />
                </li>
              ))}
            </ul>
            <label className={styles.Label}>Notes</label>
            <RichTextEditor
              key={h[0]}
              shouldHide={false}
              maxWidth={800}
              id={h[0]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historique;
