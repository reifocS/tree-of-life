export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: () => void;
}): JSX.Element {
  return (
    <>
      <div className="flex h-[calc(100vh-80px)] items-center justify-center p-5 w-full">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-red-100 p-4">
            <div className="rounded-full stroke-red-600 bg-red-200 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="mt-5 text-[36px] font-bold lg:text-[50px]">
            Applicative error
          </h1>
          <p className="mt-5 text-lg mb-2">
            <code>{error.message}</code><br/>
            Si l&apos;erreur persiste, vous pouvez réinitialiser totalement
            l&apos;état de l&apos;application
          </p>
          <p className="font-extrabold mb-2 text-lg">
            Attention vous perdrez toutes les données !
          </p>
          <button
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            onClick={() => {
              if (window.confirm("Etes vous sûre ?")) resetErrorBoundary();
            }}
          >
            Supprimer les données de la session
          </button>
        </div>
      </div>
    </>
  );
}
