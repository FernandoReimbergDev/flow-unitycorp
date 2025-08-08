"use client";

import { useRef, useState } from "react";
import { IdCard } from "lucide-react";
import { InputField, InputIcon, InputRoot } from "./Input";
import { isValidBadge } from "../utils/fnUtils";
import Image from "next/image";
import Avatar from "./assets/avatar.png";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const [badge, setBadge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { signIn } = useAuth();

  async function handleSubmit() {
    setIsLoading(true);
    if (!isValidBadge(badge)) {
      setMessage("Dados de Acesso inválido");
      setIsLoading(false);
      return;
    }

    const success = await signIn(badge);
    if (!success) {
      setMessage("Falha no login, tente novamente.");
      resetInput();
    }
    setIsLoading(false);
  }

  function resetInput() {
    setBadge("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="w-[320px] sm:w-[450px] h-[400px] sm:h-[500px] shadow-2xl p-2 sm:p-4 rounded-xl relative bg-white">
      <form
        className="w-full h-full p-4 sm:p-8 flex justify-center items-center flex-col gap-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="w-28 h-28 md:w-36 md:h-36 2xl:absolute xl:-top-14 2xl:-top-18 flex justify-center items-center shadow-xl rounded-full ">
          <Image src={Avatar} alt="Icone de um avatar de login" />
        </div>
        <h1 className="text-xl sm:text-3xl font-montserrat text-center font-[700]">Apontamento de Produção</h1>
        <p className="text-sm sm:text-xl font-montserrat text-center">
          Registre seu crachá para <span className="text-blue-500 textDestac">ENTRAR</span>
        </p>

        {isLoading ? (
          <>
            <div className="flex flex-col justify-center items-center h-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-montserrat text-bold">Carregando...</p>
          </>
        ) : (
          <>
            <InputRoot data-error={message.length > 1}>
              <InputIcon>
                <IdCard size={36} className="textDestac animate-pulse " />
              </InputIcon>
              <InputField
                type="password"
                placeholder="Bipe seu Crachá para Entrar"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                onKeyUp={handleKeyUp}
                autoFocus
                autoComplete="one-time-code"
                autoCorrect="off"
                spellCheck="false"
                ref={inputRef}
              />
            </InputRoot>
            {message && <p className="text-red-500 font-[700] font-poppins text-center">{message}</p>}
          </>
        )}
      </form>
    </div>
  );
}
