import { Element } from "../drawing";

export type User = {
  name: string;
  modelId: string;
  id: string;
};

export type Model = {
  name: string;
  elements: Element[];
  id: string;
};

export type Action = {
  leafId: string;
  leafTitle: string;
  color: string;
  categoryTitle?: string | undefined;
};

//Table Séance qui lie une date et un treeVersion
export type Seance = {
  [roomId: string]: {
    date: string;
    treeId: string;
    //userId: string;
    actions: Action[];
  };
};
