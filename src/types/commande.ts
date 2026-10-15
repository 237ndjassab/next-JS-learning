import { OrderStatus } from "../../generated/prisma/enums"

export type Orders = {
    id: string,
    client: string,
    statut: string,
    total?: number,
    merchantId: string
}

export type OrderUpdate = {
    quantity?: number,
    // productId?: string,
    orderId?: string,
    statut?: OrderStatus,
}

export type OrderDetailPromise = {
    params: Promise<{ orderId: string }>
}