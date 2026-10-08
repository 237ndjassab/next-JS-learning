import Link from "next/link";

const NotFound = () => {
  return (
    <div>
      <p>Commande introuvable</p>
      <Link href="/dashboard/orders">Voir les commandes</Link>
    </div>
  );
};

export default NotFound;
