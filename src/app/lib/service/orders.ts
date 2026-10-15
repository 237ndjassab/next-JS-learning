import { Orders } from "@/types/commande";
import { createOrder, deleteOrder, findOrderForMerchant } from "./data/order";
import { ServiceError } from "./error/ServiceError";

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

export const createOrderService = async (
  newOrder: Omit<Orders, "id" | "merchantId" | "statut">,
  currentUser: { merchantId: string }
) => {
  if (!currentUser) throw new ServiceError("utilisateur absent", 401);
  const order = createOrder({ ...newOrder, merchantId: currentUser.merchantId, statut: "en attente" });
  return order;
}
