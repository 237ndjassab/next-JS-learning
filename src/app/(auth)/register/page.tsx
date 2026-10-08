import RegisterForm from "@/app/components/common/auth/RegisterForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "register",
  description: "interface de creation de compte de ImpEx",
};
const Register = () => {
  return (
    <div className="w-[90%] h-[90%] flex flex-row gap-1">
      <div className="w-full h-full flex flex-col items-center py-5 gap-2.5">
        <h1 className="text-center font-bold text-orange-300 text-2xl">
          Bienvenue sur la plateforme ImpEx
        </h1>
        <p className="text-center font-bold text-white text-xl">
          Creer votre compte
        </p>
        <p className="text-center font-normal text-gray-500 text-base">
          Entrez vos informations de connexion ci dessous
        </p>
        <RegisterForm />
      </div>
      <div className="rounded-2xl overflow-hidden w-[1800px] relative opacity-80">
        <Image
          src="/AuthLogo.jpg"
          alt="AuthImage"
          fill={true}
          preload={true}
          objectFit="cover"
        />
      </div>
    </div>
  );
};

export default Register;
