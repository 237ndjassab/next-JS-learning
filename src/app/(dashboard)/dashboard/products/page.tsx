import { getProducts } from "@/app/lib/service/products";
import Image from "next/image";

export const revalidate = 60;

const Products = async () => {
  const produits = await getProducts();

  if (produits.length === 0) {
    return <p>Aucun produit pour le moment.</p>;
  }

  return (
    <div>
      {produits.map((p, index) => (
        <div key={p.id}>
          <Image
            src={p.image}
            alt={p.title}
            width={200}
            height={200}
            preload={index === 0}
            loading={index < 4 ? "eager" : "lazy"}
          />
          <p>{p.title}</p>
        </div>
      ))}
    </div>
  );
};

export default Products;
