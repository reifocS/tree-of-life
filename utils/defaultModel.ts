import { generateTreeFromModel, guidGenerator } from "../drawing";
import { Model } from "../types";

const MonQuotidient = "Mon quotidient";
const ParcoursDeSoin = "Mon parcours de soin";
const MesReins = "Mes reins fatiguent";
const MaVieSociale = "Ma vie sociale";
const MesSymptomes = "Mes symptômes";

//Branches and array of leafs must be in the same order
const defaultTree = {
  branches: [
    ParcoursDeSoin,
    MesReins,
    MonQuotidient,
    MaVieSociale,
    MesSymptomes,
  ],
  leafs: [
    {
      text: "Mes bilans biologiques",
      icon: "📝",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Psychologue",
      icon: "👥",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Assistance sociale",
      icon: "🧑",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Nephrologue",
      icon: "🧑‍⚕️",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Infirmière",
      icon: "🧑‍⚕️",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Diéteticien",
      icon: "🧑‍⚕️",
      categoryTitle: ParcoursDeSoin,
    },
    {
      text: "Association de patients",
      icon: "🧑‍🤝‍🧑",
      categoryTitle: ParcoursDeSoin,
    },

    {
      text: "Hémodialyse",
      icon: "🩺",
      categoryTitle: MesReins,
    },
    {
      text: "Dialyse péritonéale",
      icon: "🩺",
      categoryTitle: MesReins,
    },
    {
      text: "Greffe-don du vivant",
      icon: "🩺",
      categoryTitle: MesReins,
    },
    {
      text: "Traitement conservateur",
      icon: "🩺",
      categoryTitle: MesReins,
    },
    {
      text: "Tension artérielle",
      icon: "🩺",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Poids",
      icon: "⚖️",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Activités physiques",
      icon: "🏃",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Sommeil",
      icon: "😴",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Médicaments",
      icon: "💊",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Alimentation",
      icon: "🥕",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Projets",
      icon: "💡",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Loisirs",
      icon: "🎲",
      categoryTitle: MaVieSociale,
    },
    {
      text: "Famille",
      icon: "👪",
      categoryTitle: MaVieSociale,
    },
    {
      text: "Amis",
      icon: "🧑‍🤝‍🧑",
      categoryTitle: MaVieSociale,
    },
    {
      text: "Couple",
      icon: "💑",
      categoryTitle: MaVieSociale,
    },
    {
      text: "Travail",
      icon: "💼",
      categoryTitle: MaVieSociale,
    },
    {
      text: "Sexualité",
      icon: "❤️",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Argent",
      icon: "💵",
      categoryTitle: MonQuotidient,
    },
    {
      text: "Baisse de l'appétit",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Crampes",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Déman- geaisons",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Fatigue",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Nausées vomissements",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Oedemes",
      icon: "",
      categoryTitle: MesSymptomes,
    },
    {
      text: "Baisse/Prise de poids rapide",
      icon: "",
      categoryTitle: MesSymptomes,
    },
  ],
};

const getDefaultModel = (canvas: HTMLCanvasElement): Model => {
  let leafs = [];
  for (const branch of defaultTree.branches) {
    const leafsForBranch = defaultTree.leafs.filter(
      (l) => l.categoryTitle === branch
    );
    leafs.push(leafsForBranch);
  }
  const treeModel = generateTreeFromModel(canvas, defaultTree.branches, leafs);
  const id = guidGenerator();
  const newModel = {
    name: "Arbre de vie des reins",
    elements: treeModel,
    id,
  };

  return newModel;
};

export default getDefaultModel;
