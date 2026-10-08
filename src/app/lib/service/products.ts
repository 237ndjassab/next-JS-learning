
import { Product } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch("https://fakestoreapi.com/products", {
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`Erreur API produits (${response.status})`);
  return response.json();
};

export const getProductById = async (id: string) => {
  try {
    console.log("Api getProductById appele a : ", new Date().toISOString());
    const response = await fetch(`https://fakestoreapi.com/products/${id}`, {
      cache: "no-store",
    });
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
