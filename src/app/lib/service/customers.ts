import { Customer } from "@/types/customer";

export const getCustomers = async () => {
  try {
    const response = await fetch("https://api.example.com/customers");
    if (response.ok) {
      const data: { customers: Customer[] } = await response.json();
      return data.customers;
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

export const getUser = async () => {
  try {
    const response = await fetch("https://api.example.com/customers");
    if (response.ok) {
      const user: { customer: Customer } = await response.json();
      return user.customer;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};
