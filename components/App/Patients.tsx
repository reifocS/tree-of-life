import useLocalStorage from "../../hooks/useLocalStorage";
import useReadLocalStorage from "../../hooks/useReadLocalStorage";
import { User } from "../../types";
import Patient from "./Patient";

export default function Patients({}: {}) {
  const users = useReadLocalStorage<User[]>("users");

  if (!users) return <div></div>;

  return (
    <>
      {users.map((u) => (
        <Patient key={u.id} user={u}></Patient>
      ))}
    </>
  );
}
