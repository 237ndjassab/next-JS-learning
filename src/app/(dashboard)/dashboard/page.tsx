import { getCustomers, getUser } from "@/app/lib/service/customers";
import { getOrders } from "@/app/lib/service/orders";
import { getProducts } from "@/app/lib/service/products";
import Link from "next/link";
import type { Metadata } from 'next'

export const revalidate = 15;
 
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard de l\'application ImpEx',
}

const Dashboard = async () => {
  const [user, orders, customers, products] = await Promise.all([
    getUser(),
    getOrders(),
    getCustomers(),
    getProducts(),
  ]);
  const nomDuCommercant = user?.name;
  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-full w-full flex flex-col items-center">
        <h1 className="pb-5 text-3xl">Dashboard</h1>
        <div className="h-150 w-150 flex flex-col gap-5">
          <div>
            {nomDuCommercant ? (
              <p className="text-center text-xl">
                Bienvenue dans le dashboard {nomDuCommercant}{" "}
              </p>
            ) : (
              <p className="text-center text-xl">Bienvenue dans le dashboard</p>
            )}
          </div>
          <div className="flex flex-row justify-between gap-5">
            <div className="rounded-lg bg-blue-500 text-white p-4">
              {orders?.length || 0} commandes
            </div>
            <div className="rounded-lg bg-green-500 text-white p-4">
              {customers?.length || 0} clients
            </div>
            <div className="rounded-lg bg-yellow-500 text-white p-4">
              {products?.length || 0} produits
            </div>
          </div>
          <div className="w-full flex flex-row justify-center mt-10">
            <Link href="/dashboard/orders">Liste des commandes</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
