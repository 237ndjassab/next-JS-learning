import { Orders } from "@/types/commande";

export const orders: Orders[] = [
  {
    id: "1",
    client: "moussa",
    statut: "en attente",
    total: 8,
    merchantId: "merchant1",
  },
  {
    id: "2",
    client: "leon",
    statut: "en attente",
    total: 2,
    merchantId: "merchant2",
  },
  {
    id: "3",
    client: "saint",
    statut: "en attente",
    total: 1,
    merchantId: "merchant3",
  },
];

export const findOrder = (id: string): Orders | undefined => {
  return orders.find((order) => order.id === id);
};

export const findOrdersByMerchant = (merchantId: string): Orders[] => {
  return orders.filter((order) => order.merchantId === merchantId);
};

export const updateOrder = (
  id: string,
  changes: Partial<Orders>,
): Orders | undefined => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex === -1) return undefined;
  orders[orderIndex] = { ...orders[orderIndex], ...changes };
  return orders[orderIndex];
};

export const createOrder = (newOrder: Omit<Orders, "id">): Orders => {
  const order: Orders = {
    ...newOrder,
    id: crypto.randomUUID(),
  };
  orders.push(order);
  return order;
};

export const deleteOrder = (id: string): Orders | undefined => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex === -1) return undefined; // garde : sans elle, splice(-1) supprime le DERNIER élément
  const [deleted] = orders.splice(orderIndex, 1); // splice retourne un tableau : on en extrait l'objet
  return deleted;
};

export const findOrderForMerchant = (
  id: string,
  merchantId: string,
): Orders | undefined => {
  return orders.find(
    (order) => order.id === id && order.merchantId === merchantId,
  );
};
