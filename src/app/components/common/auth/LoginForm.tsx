"use client";

import { LoginAction } from "@/app/(auth)/login/loginAction";
import Link from "next/link";
import { useActionState } from "react";

const LoginForm = () => {
  const [state, formAction, pending] = useActionState(LoginAction, {
    success: false,
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
            <label htmlFor="nom">nom d&apos;utilisateur ou email</label>
            <div className="w-full ring-white ring-1 rounded-md overflow-hidden">
              <input type="text" name="nom" id="nom" className="w-full outline-0 p-2.5" />
            </div>
            {state.errors?.nom && (
              <p className="text-red-500 text-[13px]">{state.errors.nom.errors[0]}</p>
            )}
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="passwd">Mot de passe</label>
            <div className="w-full ring-white ring-1 rounded-md overflow-hidden">
              <input type="password" name="passwd" id="passwd" className="w-full outline-0 p-2.5" />
            </div>
            {state.errors?.passwd && (
              <p className="text-red-500 text-[13px]">{state.errors.passwd.errors[0]}</p>
            )}
          </div>
          <div className="w-full flex flex-row justify-end">
            <span className="text-orange-300 text-[14px]">Mot de passe oublie</span>
          </div>
        </div>
        <div className="w-full px-2.5 flex flex-col gap-2.5">
          <button type="submit" className="w-full rounded-md bg-orange-400 p-2.5 text-black hover:bg-orange-500 hover:scale-105 active:scale-100 transition-all duration-200 ease-in">{pending ? "Connexion" : "Confirmer"}</button>
          <p className="text-center">
            Vous n&apos;avez pas de compte ? <Link href="/register" className="text-orange-300 hover:text-orange-400 hover:underline text-base">Creer un compte</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
