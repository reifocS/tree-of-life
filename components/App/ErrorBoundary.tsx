export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: () => void;
}): JSX.Element {
  return (
    <div role="alert" className="text-center">
      <p>Il y a eu un soucis:</p>
      <pre>{error.message}</pre>
      Si l&apos;erreur persiste, vous pouvez réinitialiser totalement l&apos;état de l&apos;application  
      <br/>
      <span className="font-extrabold">attention vous perdrez toutes les données!</span>
      <br />
      <button
        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        onClick={resetErrorBoundary}
      >
        Supprimer les données de la session
      </button>
    </div>
  );
}
