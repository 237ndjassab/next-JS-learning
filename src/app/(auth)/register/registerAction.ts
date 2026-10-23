"use server";

import { registerSchema } from "@/app/schemas/register";
import * as z from "zod";

export const RegisterAction = async (_prevState: any, formData: FormData) => {
  const validate = registerSchema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    passwd: formData.get("passwd"),
  });
  if (!validate.success) {
    const tree = z.treeifyError(validate.error);
    return {
      succes: false,
      errors: tree.properties,
    };
  }
  console.log("Validated data: ", validate.data);
  return {
    succes: true,
    errors: undefined,
  };
};
