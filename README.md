This is a [Next.js](https://nextjs.org/) project
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

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
