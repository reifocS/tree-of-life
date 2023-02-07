import Link from "next/link";
import { useRouter } from "next/router";
import { groupBy } from "../../components/App/Model";
import RichTextEditor from "../../components/Editor/RichTextEditor";
import useLocalStorage from "../../hooks/useLocalStorage";
import useReadLocalStorage from "../../hooks/useReadLocalStorage";
import styles from "../../styles/Historique.module.css";
import { Action, Model, Seance, User } from "../../types";
const Historique = () => {
  const router = useRouter();
  // userId
  const { id: userId } = router.query;
  const [seances] = useLocalStorage<Seance>("tof-seance", {});
  const users = useReadLocalStorage<User[]>("users");
  const currentUser = users?.find((u) => u.id === userId);
  const histo = Object.entries(seances).filter(([, v]) => {
    return v.userId === userId;
  });
  histo.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    const dateA = new Date(a[1].date).getTime();
    const dateB = new Date(b[1].date).getTime();
    return dateA < dateB ? 1 : -1;
  });
  return (
    <>
      <Link
        href="/patients"
        className="m-3 inline-flex items-center justify-center xl:text-xl h-14 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2"
      >
        Gérer mes patients
      </Link>
      <h1 className="font-extrabold text-center mb-2">
        Historique du patient {currentUser?.name}
      </h1>
      <div className="flex flex-col items-center justify-center">
        <div className="inline-flex flex-col gap-4 mb-4">
          {histo.map((h) => (
            <div
              key={h[0]}
              className="flex flex-col gap-2 justify-center items-center bg-gray-800 p-4"
            >
              <div className="flex gap-2">
                <h3>Séance du {new Date(h[1].date).toLocaleDateString()}</h3>
                <Link
                  className="underline"
                  href={`/arbre/${h[1].userId}?room=${h[0]}`}
                >
                  Voir l&apos;arbre
                </Link>
              </div>
              <label className={styles.Label}>Thèmes abordés</label>
              <div className={styles.Actions}>
                {Object.entries(groupBy(h[1].actions, "categoryTitle")).map(
                  ([k, v]) => {
                    return (
                      <div key={k}>
                        <p className={styles.Category}>{k}</p>
                        <ul role="list">
                          {v.map((ac: Action) => (
                            <li
                              className={styles.ActionItem}
                              key={ac.leafId}
                              style={{
                                color: ac.color,
                              }}
                            >
                              {ac.leafTitle}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                )}
              </div>
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
    </>
  );
};

export default Historique;
