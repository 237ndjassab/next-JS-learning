"use server";

import { createOrderSchema } from "@/app/schemas/order";
import { Orders } from "@/types/commande";
import { revalidatePath } from "next/cache";
import z from "zod";

export const createOrder = async (prevState: any, formData: FormData) => {
  const validateData = createOrderSchema.safeParse({
    productName: formData.get("productName"),
    quantity: formData.get("quantity"),
    description: formData.get("description"),
  });
  if (!validateData.success) {
    const tree = z.treeifyError(validateData.error);
    return {
      success: false,
      errors: tree.properties,
    };
  }
  console.log("Validated data: ", validateData.data);
  revalidatePath("/dashboard/orders");
  return {
    success: true,
    errors: undefined,
  };
};

// fonction fictive
const getConnectedMerchantId = async () => {
  return {
    success: true,
    id: 75788,
  };
};
//
export const cancelOrder = async (orderId: string) => {
  const merchantId = (await getConnectedMerchantId()).id;
  //je simule une fonction qui fait la requette a la base de donnee et qui est situe dans le dossier lib ou service
  const order = (await getOrderById(orderId)) as Orders;
  if (!order) {
    return {
      success: false,
      error: "La commande n'a pas ete trouvé",
    };
  }
  if (Number(order.merchantId) !== merchantId) {
    return {
      success: false,
      error: "pas autorisé",
    };
  }
  if (order.statut == "DELIVERED") {
    return {
      success: false,
      error: "Impossible d'annuler une commande deja livrée",
    };
  }
  await cancelOrderById(orderId);
  return {
    success: true,
  };
};
