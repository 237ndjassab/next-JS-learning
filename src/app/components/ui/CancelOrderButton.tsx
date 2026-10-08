"use client";

import { useState } from "react";

const CancelOrderButton = ({
  orderStatus,
}: {
  orderStatus: string;
}) => {
  const [order, setOrder] = useState<string>(orderStatus);
  return (
    <div>
      {order ? (
        <>
          <button onClick={() => setOrder("annulee")}>
            changer le status
          </button>
          <p>le status de la commande est : {order}</p>
        </>
      ) : null}
    </div>
  );
};

export default CancelOrderButton;
