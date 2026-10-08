import { getOrders } from "@/app/lib/service/orders";
import NewOrderForm from "@/app/components/common/admin/NewOrderForm";
import Link from "next/link";

export const revalidate = 0;

const OrdersPage = async () => {
  const commande = await getOrders();
  return (
    <>
      <div>Commandes</div>
      <ul>
        {commande?.map((com) => (
          <li key={com.id}>
            <Link href={`/dashboard/orders/${com.id}`}>
              {com.id} - {com.client} ({com.statut})
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <h4>ajouter une commande</h4>
        <NewOrderForm />
      </div>
    </>
  );
};

export default OrdersPage;
