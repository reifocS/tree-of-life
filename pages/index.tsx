import { NextPage } from "next";
import Link from "next/link";

const Models: NextPage = () => {
  return (
    <>
      <h1 className="mt-10 text-center mb-10 text-3xl font-extrabold">
        L&apos;arbre de vie des reins
      </h1>
      <div className="flex items-center justify-center">
      <Link
        className="text-white font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        href="/patients"
      >
        Mes patients
      </Link>
      <Link
        className="text-white font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300  rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        href="/arbre/edit"
      >
        Mes arbres
      </Link>
      </div>
     
    </>
  );
};

export default Models;
