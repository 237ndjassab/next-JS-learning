import { NextResponse } from "next/server";
import {
  deleteOrderById,
} from "@/app/lib/service/orders";
import { updateOrderSchema } from "@/app/schemas/order";
import { parseJsonBody } from "@/app/lib/service/error/parseJsonBody";
import { handleRouteError } from "@/app/lib/service/error/handleRouteError";
import {  findOrderById, updateOrderById } from "@/app/lib/service/order.service";

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
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
      userId: "cmv898dc800048ovsr1ltqpqa",
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
    const { id } = await params;
    const order = await findOrderById(id, { userId: "merchant2" });
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
