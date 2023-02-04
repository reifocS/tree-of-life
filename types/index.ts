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

//Map de Séances qui lient une date et un user
export type Seance = {
  [roomId: string]: {
    date: string;
    treeId: string;
    userId: string;
    actions: Action[];
  };
};
