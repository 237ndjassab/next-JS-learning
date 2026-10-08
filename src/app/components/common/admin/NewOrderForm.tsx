"use client";

import { createOrder } from "@/app/(dashboard)/dashboard/orders/action";
import { createOrderSchema } from "@/app/schemas/order";
import SubmitButton from "@/app/components/ui/SubmitButton";
import { useActionState, useState } from "react";

const NewOrderForm = () => {
  const [state, formAction] = useActionState(createOrder, {
    success: false,
    errors: undefined,
  });
  const [liveErrors, setLiveErrors] = useState<{
    productName: string | null,
    quantity: string | null,
    description: string | null,
  }>({
    productName: null,
    quantity: null,
    description: null,
  });
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input name="productName" type="text" className="border-2 border-amber-100 rounded-2xl p-1.5 text-black bg-amber-100" placeholder="Nom du produit" onBlur={(e) => {
        const result = createOrderSchema.shape.productName.safeParse(e.target.value);
        if (!result.success) {
          setLiveErrors((prev) => ({ ...prev, productName: result.error.issues[0].message }));
        } else {
          setLiveErrors((prev) => ({ ...prev, productName: null }));
        }
      }} />
      {liveErrors.productName ? (
        <p className="text-red-500">{liveErrors.productName}</p>
      ) : state?.errors?.productName && (
        <p className="text-red-500">{state.errors.productName.errors[0]}</p>
      )}
      <input name="quantity" type="number" className="border-2 border-amber-100 rounded-2xl p-1.5 text-black bg-amber-100" placeholder="Quantité" />
      {state?.errors?.quantity && <p className="text-red-500">{state.errors.quantity.errors[0]}</p>}
      <input name="description" type="text" className="border-2 border-amber-100 rounded-2xl p-1.5 text-black bg-amber-100" placeholder="Description" />
      {state?.errors?.description && (
        <p className="text-red-500">{state.errors.description.errors[0]}</p>
      )}
      <SubmitButton />
    </form>
  );
};

export default NewOrderForm;
