import { handleRouteError } from "@/app/lib/service/error/handleRouteError";
import { parseJsonBody } from "@/app/lib/service/error/parseJsonBody";
import { getMerchantOrders } from "@/app/lib/service/order.service";
import {
  createOrderService,
} from "@/app/lib/service/orders";
import { createOrderSchema } from "@/app/schemas/order";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const orders = await getMerchantOrders({ merchantId: "merchant2" });
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
export const POST = async (req: Request) => {
  try {
    const body = await parseJsonBody(req);
    const validations = createOrderSchema.safeParse(body);
    if (!validations.success) {
      return NextResponse.json(
        {
          success: false,
          message: "les données de la commande sont invalides",
          errors: validations.error.format(),
        },
        { status: 400 },
      );
    }
    const newOrder = await createOrderService(validations.data, {
      merchantId: "merchant2",
    });
    return NextResponse.json(
      {
        success: true,
        message: "la commande a été créée avec succès",
        data: newOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};
