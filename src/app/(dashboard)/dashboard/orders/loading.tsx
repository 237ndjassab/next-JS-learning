import Spinner from "@/app/components/ui/Spinner";

const OrdersLoading = () => {
  return (
    <div className="h-[90vh] w-full">
      <div
        role="status"
        className="h-full w-full flex gap-2 items-center justify-center"
      >
        <Spinner />
        <span className="not-sr-only">Chargement des commandes...</span>
      </div>
    </div>
  );
};

export default OrdersLoading;
