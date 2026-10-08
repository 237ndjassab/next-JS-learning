"use client";

import { useFormStatus } from "react-dom";

const SubmitButton = () => {
  const status = useFormStatus();
  return (
    <button type="submit" disabled={status.pending} className="btn btn-primary bg-amber-500 text-black hover:bg-amber-600 hover:text-white rounded-2xl p-1.5">
      {status.pending ? "Création en cours..." : "Créer la commande"}
    </button>
  );
};

export default SubmitButton;
