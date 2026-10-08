"use server";
import { deleteOrderById } from "../lib/service/orders";

export const deleteOrderByIdACTION = async (id: string) => {
  try {
    const result = await deleteOrderById(id, currentUser);
    return { success: true, result };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
};
