// export const getInfoShop = async () => {
//   console.log("Api getInfoShop appele a : ", new Date().toISOString());
//   const infoShop = [{ name: "Ma boutique", createdAt: "2020-01-01" }];
//   return Response.json(infoShop);
// };
export const getInfoShop = async () => {
  console.log("Api getInfoShop appele a : ", new Date().toISOString());
  try {
    const response = await fetch("https://fakestoreapi.com/products/1", {
      cache: "force-cache",
    });
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
