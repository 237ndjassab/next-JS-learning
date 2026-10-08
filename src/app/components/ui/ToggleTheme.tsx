"use client";
import { setTheme, Theme } from "@/app/theme/theme";
import { useState } from "react";

const ToggleTheme = () => {
  const [mood, setMood] = useState<Theme>("light");
  return (
    <button
      className="btn btn-primary absolute top-2.5 right-2.5 bg-amber-500 text-black hover:bg-amber-600 hover:text-white rounded-2xl p-1.5"
      onClick={() => {
        const newTheme: Theme = mood === "light" ? "dark" : "light";
        setMood(newTheme);
        setTheme(newTheme);
      }}
    >
      changer le theme
    </button>
  );
};

export default ToggleTheme;
