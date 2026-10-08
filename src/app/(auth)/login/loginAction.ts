"use server";
import { LoginSchema } from "@/app/schemas/login";
import * as z from "zod";

export const LoginAction = async (prevState: any, formData: FormData) => {
  const validate = LoginSchema.safeParse({
    nom: formData.get("nom"),
    passwd: formData.get("passwd"),
  });
  if (!validate.success) {
    const tree = z.treeifyError(validate.error);
    return {
      success: false,
      errors: tree.properties,
    };
  }
  console.log("Validated data: ", validate.data);
  return {
    success: true,
    errors: undefined,
  };
};
