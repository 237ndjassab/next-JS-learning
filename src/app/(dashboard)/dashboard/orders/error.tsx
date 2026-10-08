"use client";

const ErrorOrders = ({
  error,
  reset,
} : {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.error('error : ', error);
  return (
    <div>
      <h2>une erreur est survenue !</h2>
      <button onClick={() => reset()}>Reessayer</button>
    </div>
  );
};

export default ErrorOrders;
