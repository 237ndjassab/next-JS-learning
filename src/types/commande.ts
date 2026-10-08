export type Orders = {
    id: string,
    client: string,
    statut: string,
    total?: number
    merchantId: string
}

export type OrderDetailPromise = {
    params: Promise<{ orderId: string }>
}