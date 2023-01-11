import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Model } from "../../components/App/Model";
import useLocalStorage from "../../hooks/useLocalStorage";

const DynamicComponentWithNoSSR = dynamic(
  import("../../components/App/CanvasEditing"),
  {
    ssr: false,
  }
);

const Arbre = () => {
  const router = useRouter();
  const { id } = router.query;
  const [models] = useLocalStorage<Model[]>("models", []);
  const treeFromModel = models.find((m) => m.id === id);
  if (!treeFromModel) {
    //TODO redirect to 404
    return <p>Oups, l&apos;arbre n&apos;existe pas</p>;
  }
  return <DynamicComponentWithNoSSR treeFromModel={treeFromModel} />;
};

export default Arbre;
