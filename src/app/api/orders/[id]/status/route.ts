import { can, Permission } from "@/app/lib/auth/permissions";
import { handleRouteError } from "@/app/lib/service/error/handleRouteError";
import { parseJsonBody } from "@/app/lib/service/error/parseJsonBody";
import { changeOrderStatus } from "@/app/lib/service/order-status.service";
import { NextResponse } from "next/server";
import { OrderStatus } from "../../../../../../generated/prisma/enums";
import z from "zod";
import { ServiceError } from "@/app/lib/service/error/ServiceError";
import { requireSession } from "@/app/lib/guards/require-session";

const statusSchema = z
  .object({ to: z.enum(OrderStatus), reason: z.string().max(200).optional() }) // Zod 4 ; en Zod 3 : z.nativeEnum(OrderStatus)
  .strict(); // refuse toute clé inconnue → pas de mass assignment

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await requireSession(); // 401 immédiat, avant tout parsing
    const { id } = await params;

    const parsed = statusSchema.safeParse(await parseJsonBody(req));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 },
      );
    }

    const permission: Permission =
      parsed.data.to === "CANCELLED" ? "order:cancel" : "order:transition";
    if (!can(session.user.role, permission)) {
      throw new ServiceError("Forbidden", 403); // même résultat que requirePermission, sans 2e lecture BDD
    }

    const { user } = session; // déjà chargé, déjà vérifié

    const result = await changeOrderStatus({
      orderId: id,
      to: parsed.data.to,
      reason: parsed.data.reason,
      actor: { userId: user.id, role: user.role },
    });
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
};
