import { OrderDetailPromise, Orders } from "@/types/commande";
import CancelOrderButton from "@/app/components/ui/CancelOrderButton";
import BackButton from "@/app/components/ui/BackButton";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: OrderDetailPromise): Promise<Metadata> {
  const { orderId } = await params;

  const details = await getOrderById(orderId);
  if (!details) {
    notFound();
  }

  return {
    title: `Détails de la commande #${orderId}`,
    description: `Détails de la commande #${orderId} pour le client ${details.client}`,
  };
}

const getOrderById = async (orderId: string) => {
  const response = await fetch(`https://api.example.com/orders/${orderId}`);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Erreur API (${response.status})`);

  return (await response.json()) as Orders;
};

const OrderDetails = async ({ params }: OrderDetailPromise) => {
  const { orderId } = await params;

  const cmd = await getOrderById(orderId);
  if (!cmd) {
    notFound();
  }
  // const thisOrderStatus = commande.find((com) => com.id === orderId);
  return (
    <>
      <div>
        <BackButton />
        <h1>Détail de la commande #{orderId}</h1>

        <div>
          <p>Client: {cmd.client}</p>
          <p>Statut: {cmd.statut}</p>
          <p>Id: {cmd.id}</p>
          <CancelOrderButton orderStatus={cmd.statut} />
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
