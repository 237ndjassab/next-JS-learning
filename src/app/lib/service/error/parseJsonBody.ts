import { ServiceError } from "./ServiceError";

export const parseJsonBody = async (req: Request): Promise<unknown> => {
  try {
    return await req.json();
  } catch {
    throw new ServiceError("le corps de la requête doit être du JSON valide", 400);
  }
};