import { Produto } from "../../components/FormProduto";

export const metadata = {
  title: "Flow | Produto",
  description: "Veja os produtos disponíveis para produção",
};

export default function Pedido() {
  return (
    <div className="w-screen min-h-dvh h-fit px-4 py-24 lg:py-16 mx-auto grid place-content-center backgroundPage">
      <Produto />
    </div>
  );
}
