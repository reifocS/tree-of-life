import { generateTreeFromModel, guidGenerator } from "../drawing";
import { Model } from "../types";

const defaultTree = {
  branches: [
    "Parcours de soins",
    "Mes reins fatiguent",
    "Mon quotidien",
    "Ma vie sociale",
  ],
  leafs: [
    [
      {
        text: "Mes bilans biologiques",
        icon: "📝",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Psychologue",
        icon: "👥",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Assistance sociale",
        icon: "🧑",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Nephrologue",
        icon: "🧑‍⚕️",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Infirmière",
        icon: "🧑‍⚕️",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Diéteticien",
        icon: "🧑‍⚕️",
        categoryTitle: "Parcours de soins",
      },
      {
        text: "Association de patients",
        icon: "🧑‍🤝‍🧑",
        categoryTitle: "Parcours de soins",
      },
    ],
    [
      {
        text: "Hémodialyse",
        icon: "🩺",
        categoryTitle: "Mes reins fatiguent",
      },
      {
        text: "Dialyse péritonéale",
        icon: "🩺",
        categoryTitle: "Mes reins fatiguent",
      },
      {
        text: "Greffe",
        icon: "🩺",
        categoryTitle: "Mes reins fatiguent",
      },
      {
        text: "Traitement conservateur",
        icon: "🩺",
        categoryTitle: "Mes reins fatiguent",
      },
    ],
    [
      {
        text: "Tension artérielle",
        icon: "🩺",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Poids",
        icon: "⚖️",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Activités physiques",
        icon: "🏃",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Médicaments",
        icon: "💊",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Alimentation",
        icon: "🥕",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Projets",
        icon: "💡",
        categoryTitle: "Mon quotidien",
      },
      {
        text: "Finances",
        icon: "💶",
        categoryTitle: "Mon quotidien",
      },
    ],
    [
      {
        text: "Loisirs",
        icon: "🎲",
        categoryTitle: "Ma vie sociale",
      },
      {
        text: "Famille",
        icon: "👪",
        categoryTitle: "Ma vie sociale",
      },
      {
        text: "Amis",
        icon: "🧑‍🤝‍🧑",
        categoryTitle: "Ma vie sociale",
      },
      {
        text: "Couple",
        icon: "💑",
        categoryTitle: "Ma vie sociale",
      },
      {
        text: "Travail",
        icon: "💼",
        categoryTitle: "Ma vie sociale",
      },
      {
        text: "Sexualité",
        icon: "♥️",
        categoryTitle: "Ma vie sociale",
      },
    ],
  ],
};


const getDefaultModel = (canvas: HTMLCanvasElement): Model => {
  const treeModel = generateTreeFromModel(
    canvas,
    defaultTree.branches,
    defaultTree.leafs
  );
  const id = guidGenerator();
  const newModel = {
    name: "Arbre de vie des reins",
    elements: treeModel,
    id,
  };

  return newModel;
};

export default getDefaultModel;
