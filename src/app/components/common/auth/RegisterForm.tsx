"use client";

import { RegisterAction } from "@/app/(auth)/register/registerAction";
import Link from "next/link";
import { useActionState } from "react";

const RegisterForm = () => {
  const [state, formAction, pending] = useActionState(RegisterAction, {
    succes: false,
    errors: undefined,
  });
  return (
    <div className="w-full h-full py-2.5">
      <form
        action={formAction}
        className="w-full h-full px-10 flex flex-col justify-between"
      >
        <div className="w-full flex flex-col gap-2.5">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="nom">nom d&apos;utilisateur</label>
            <div className="w-full ring-white ring-1 rounded-md overflow-hidden">
              <input
                type="text"
                name="nom"
                id="nom"
                className="w-full outline-0 p-2.5"
              />
            </div>
            {state.errors?.nom && (
              <p className="text-red-500 text-[13px]">
                {state.errors.nom.errors[0]}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="email">email</label>
            <div className="w-full ring-white ring-1 rounded-md overflow-hidden">
              <input
                type="email"
                name="email"
                id="email"
                className="w-full outline-0 p-2.5"
              />
            </div>
            {state.errors?.email && (
              <p className="text-red-500 text-[13px]">
                {state.errors.email.errors[0]}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="passwd">Mot de passe</label>
            <div className="w-full ring-white ring-1 rounded-md overflow-hidden">
              <input
                type="password"
                name="passwd"
                id="passwd"
                className="w-full outline-0 p-2.5"
              />
            </div>
            {state.errors?.passwd && (
              <p className="text-red-500 text-[13px]">
                {state.errors.passwd.errors[0]}
              </p>
            )}
          </div>
        </div>
        <div className="w-full px-2.5 flex flex-col gap-2.5">
          <button
            type="submit"
            className="w-full rounded-md bg-orange-400 p-2.5 text-black hover:bg-orange-500 hover:scale-105 active:scale-100 transition-all duration-200 ease-in"
          >
            {pending ? "Creation..." : "Confirmer"}
          </button>
          <p className="text-center">
            Vous avez deja un compte ?{" "}
            <Link
              href="/login"
              className="text-orange-300 hover:text-orange-400 hover:underline text-base"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
