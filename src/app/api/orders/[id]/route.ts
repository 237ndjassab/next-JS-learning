import { NextResponse } from "next/server";
import { deleteOrderById } from "@/app/lib/service/orders";
import { updateOrderSchema } from "@/app/schemas/order";
import { parseJsonBody } from "@/app/lib/service/error/parseJsonBody";
import { handleRouteError } from "@/app/lib/service/error/handleRouteError";
import {
  findOrderById,
  updateOrderById,
} from "@/app/lib/service/order.service";
import { requireAnyPermission, requirePermission } from "@/app/lib/guards/require-permission";

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { user } = await requirePermission("order:edit");
    const param = await params;
    const body = await parseJsonBody(req);
    // console.log("thisOrder : ", body);
    const validations = updateOrderSchema.safeParse(body);
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

    const updatedOrder = await updateOrderById(param.id, validations.data, {
      userId: user.id, // identité issue de la session en BDD, jamais du client
      role: user.role, // le service en a besoin : MERCHANT, DRIVER et ADMIN n'ont pas les mêmes règles
    });
    return NextResponse.json(
      {
        success: true,
        message: "la commande a été mise à jour avec succès",
        data: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const result = await deleteOrderById(id, { merchantId: "merchant2" }); // mock : session en semaine 5
    return NextResponse.json(
      {
        success: true,
        message: "la commande a été supprimée avec succès",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { user } = await requireAnyPermission(["order:read:own", "order:read:any"]);
    const { id } = await params;
    const order = await findOrderById(id, {
      userId: user.id, // identité issue de la session en BDD, jamais du client
      role: user.role, // le service en a besoin : MERCHANT, DRIVER et ADMIN n'ont pas les mêmes règles
    });
    return NextResponse.json(
      {
        success: true,
        message: "la commande a été récupérée avec succès",
        data: order,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};
