import { getCustomers } from "@/app/lib/service/customers";

export const revalidate = 60;

const Customers = async () => {
  const customers = await getCustomers();
  return (
    <div>
      {customers ? (
        customers.map((customer) => (
          <div key={customer.id}>
            <p>{customer.name}</p>
          </div>
        ))
      ) : (
        <p>Aucun client disponible</p>
      )}
    </div>
  );
};

export default Customers;
