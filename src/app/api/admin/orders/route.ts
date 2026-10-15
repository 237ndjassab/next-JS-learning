import { handleRouteError } from "@/app/lib/service/error/handleRouteError";
import { getOrders } from "@/app/lib/service/order.service";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const orders = await getOrders();
    return NextResponse.json(
      {
        success: true,
        message: "les commandes ont été récupérées avec succès",
        data: orders,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};
