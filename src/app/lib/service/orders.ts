import { Orders } from "@/types/commande";
import { API_URL } from "../env";
import { createOrder, deleteOrder, findOrderForMerchant, findOrdersByMerchant, updateOrder } from "./data/order";
import { ServiceError } from "./error/ServiceError";

export const getOrders = async () => {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    const response = await fetch(API_URL);
    if (response.ok) {
      const data: { orders: Orders[] } = await response.json();
      return data.orders;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    // throw error;
  }
};
// export const getOrders = async () => {
//   try {
//     await new Promise((resolve) => {
//       setTimeout(resolve, 3000);
//     });
//     const response = await fetch(API_URL);
//     if (response.ok) {
//       const data: { orders: Orders[] } = await response.json();
//       return data.orders;
//     }
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     // throw error;
//   }
// };

export const getMerchantOrders = async (currentUser: { merchantId: string }) => {
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  if (!currentUser.merchantId)
    throw new ServiceError("l'id du marchand est absent", 400);
  return findOrdersByMerchant(currentUser.merchantId);
};

export const deleteOrderById = async (
  id: string,
  currentUser: { merchantId: string },
) => {
  if (!id) throw new ServiceError("l'id de la commande est obligatoire", 400);
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  if (!currentUser.merchantId)
    throw new ServiceError("l'id du marchand est absent", 400);

  // Un seul test : introuvable OU appartenant à un autre commerçant ➔ même réponse 404
  const order = findOrderForMerchant(id, currentUser.merchantId);
  if (!order) throw new ServiceError("commande introuvable", 404);

  const deletedOrder = deleteOrder(id);
  if (!deletedOrder) throw new ServiceError("commande introuvable", 404);
  return deletedOrder;
};

export const findOrderById = async (id: string, currentUser: { merchantId: string }) => {
  if (!id) throw new ServiceError("l'id de la commande est obligatoire", 400);
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  if (!currentUser.merchantId)
    throw new ServiceError("l'id du marchand est absent", 400);
  const order = findOrderForMerchant(id, currentUser.merchantId);
  if (!order)
    throw new ServiceError(
      "commande pas retrouvé veuillez essayer avec un autre identifiant",
      404
    );
  return order;
};

export const updateOrderById = async (
  id: string,
  changes: Partial<Orders>,
  currentUser: { merchantId: string },
) => {
  if (!id) throw new ServiceError("l'id de la commande est obligatoire", 400);
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  if (!currentUser.merchantId)
    throw new ServiceError("l'id du marchand est absent", 400);
  const orderFound = await findOrderById(id, { merchantId: currentUser.merchantId });
  const order = updateOrder(id, changes);
  if (!order)
    throw new ServiceError(
      "commande pas retrouvé veuillez essayer avec un autre identifiant",
      404
    );
  return order;
};

export const createOrderService = async (
  newOrder: Omit<Orders, "id" | "merchantId" | "statut">,
  currentUser: { merchantId: string }
) => {
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  const order = createOrder({ ...newOrder, merchantId: currentUser.merchantId, statut: "en attente" });
  return order;
}
