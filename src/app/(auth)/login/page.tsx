import LoginForm from "@/app/components/common/auth/LoginForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "login",
  description: "interface de connexion de ImpEx",
};
const Login = () => {
  return (
    <div className="w-[90%] h-[90%] flex flex-row gap-1">
      <div className="w-full h-full flex flex-col items-center py-5 gap-2.5">
        <p className="text-center font-bold text-white text-2xl">
          Connectez vous
        </p>
        <p className="text-center font-normal text-gray-500 text-base">
          Entrez vos informations de connexion ci dessous
        </p>
        <LoginForm />
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

export default Login;
