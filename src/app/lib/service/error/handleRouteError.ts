import { NextResponse } from "next/server";
import { ServiceError } from "./ServiceError";

export const handleRouteError = (error: unknown) => {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status },
    );
  }
  console.error("Erreur inattendue :", error); // détail côté serveur uniquement
  return NextResponse.json(
    { success: false, message: "une erreur interne est survenue" },
    { status: 500 },
  );
};