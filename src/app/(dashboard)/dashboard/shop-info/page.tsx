import { getInfoShop } from "@/app/lib/service/shop-info";

const ShopInfo = async () => {
  const info = await getInfoShop();
  return (
    <div>
      <p>{info.title}</p>
    </div>
  );
};

export default ShopInfo;
