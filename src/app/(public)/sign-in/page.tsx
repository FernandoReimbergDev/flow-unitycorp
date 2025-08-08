import { Login } from "../../components/FormLogin";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Flow | Identificação",
  description: "Sistema de Apontamento de etapas produtivas",
};

export default function Home() {
  return (
    <div className="w-screen min-h-dvh p-4 mx-auto grid place-content-center backgroundPage">
      <Login />
    </div>
  );
}
