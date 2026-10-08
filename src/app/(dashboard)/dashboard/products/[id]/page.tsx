import { getProductById } from "@/app/lib/service/products";

const ProductDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = await getProductById(id);
  return (
    <div>
      <h1>{product?.title}</h1>
    </div>
  );
};

export default ProductDetailPage;
