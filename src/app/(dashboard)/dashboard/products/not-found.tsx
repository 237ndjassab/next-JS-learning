import Link from "next/link";

const NotFound = () => {
  return (
    <div>
      <p>Produits introuvables</p>
      <Link href="/dashboard">Revenir au dashboard</Link>
    </div>
  );
};

export default NotFound;
