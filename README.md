# L'arbre de vie

## Contexte
L'arbre de vie des reins est une application web qui vise à faciliter la prise de parole des patients atteints de maladies rénales chroniques et ainsi garantir un meilleur suivi par le soignant. 

Il s'agit d'un projet réalisé par des étudiants en Ingénierie Logicielle à IMT Atlantique en partenariat avec le service Néphrologie du CHU de Nantes.

Dans cette application, chaque feuille de l'arbre représente un thème de vie.

Pendant la consultation médicale, le patient peut parcourir son arbre, à l'aide de contrôles tactiles standards,  pour  indiquer au soignant les thèmes qu'il souhaite aborder ou non durant la séance. 
Pour ce faire, le patient dispose d'un code couleur : il se sent à l'aise de discuter de sa famille : il colore la feuille en vert. Il veut bien discuter de son couple, mais c'est un sujet compliqué pour lui : il met la feuille en rouge. 

Le soignant peut notamment : 
créer un nouveau patient
voir son historique
créer un arbre vierge, l'éditer, et l'attribuer à son patient en vue de sa prochaine consultation.
etc etc...


La pandémie covid-19 a montré le besoin de pouvoir faire des consultations à distance. L'application arbre de vie des reins est donc utilisable par le soignant et le patient à distance en simultanée grâce au simple partage d'un lien web.
## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Credentials are hardcoded in [middleware](middleware.ts) as admin/admin, you should replace it by env variables.  

Everything is stored in the browser [local storage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage), except for the anonymised multiplayer data (the whole tree shape for a seance) which is hosted on [liveblocks](https://liveblocks.io/docs). A custom WebSocket solution and a self-hosted database could replace this solution.  

Session data can be exported to JSON and imported in another browser using the same file. 

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Canvas](https://developer.mozilla.org/fr/docs/Web/API/Canvas_API)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
