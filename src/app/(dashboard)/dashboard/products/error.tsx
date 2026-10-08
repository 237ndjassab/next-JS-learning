"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div>
      <h2>Une erreur est survenue!</h2>
      <button onClick={() => retry()}>Reessayer</button>
    </div>
  );
}
