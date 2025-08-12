"use client";

import Image from "next/image";
import successImg from "./assets/success.svg";
import SkeletonLayout from "./assets/skeleton_layout.png";
import { useEffect, useState, useRef } from "react";
import { ScanBarcode, Barcode } from "lucide-react";
import { InputField, InputIcon, InputRoot } from "./Input";
import { frasesMotivacionais } from "../utils/fnUtils";
import { useAuth } from "../../context/AuthContext";
import "./style.css";

type ResultadoPedido = {
  pathPedPath?: string;
  nomeCliente: string;
  descr2Pro: string;
  corPedPro: string;
  corGravaPedPro: string;
  dtEntregaPed: string;
  qtdPedPro: string;
  descrPedProSit: string;
};

export function Produto() {
  const [chavepedpro, setChavepedpro] = useState("");
  const [chaveSit, setChavepedSit] = useState("");
  const [chavePed, setChavePed] = useState("");
  const [codPro, setCodPro] = useState("codigo produto");
  const [corPedPro, setCorPedPro] = useState("cor produto");
  const [dataProducao, setDataProducao] = useState("");
  const [localMaterial, setLocalMaterial] = useState("");
  const [embalagem, setEmbalagem] = useState("");
  const [quantidadeConferida, setQuantidadeConferida] = useState(0);
  const [material, setMaterial] = useState(false);
  const [mostrarInputData, setMostrarInputData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagemPed, setMensagemPed] = useState("");
  const [mensagemSit, setMensagemSit] = useState("");
  const [dadosPedPro, setDadosPedPro] = useState<ResultadoPedido | null>(null);
  const [userName, setUserName] = useState("");
  const [userImg, setUserImg] = useState("");
  const inputRefPro = useRef<HTMLInputElement>(null);
  const inputRefSit = useRef<HTMLInputElement>(null);
  const [fraseAleatoria, setFraseAleatoria] = useState("");
  const [finishMsg, setFinishMsg] = useState(false);
  const { user } = useAuth();
  const { signOut } = useAuth();

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserImg(user.image);
    }
  }, [user]);

  useEffect(() => {
    const index = Math.floor(Math.random() * frasesMotivacionais.length);
    setFraseAleatoria(frasesMotivacionais[index]);
  }, []);

  function resetInput(
    setState: React.Dispatch<React.SetStateAction<string>>,
    ref: React.RefObject<HTMLInputElement | null>
  ) {
    setState("");
    setTimeout(() => {
      ref.current?.focus();
    }, 100);
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }
  function handleKeyUpSit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmitchaveSit();
    }
  }

  useEffect(() => {
    if (finishMsg) {
      const timeout = setTimeout(() => {
        signOut();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [finishMsg, signOut]);

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const response = await fetch("../api/ordem-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chavepedpro }),
      });

      const data = await response.json();
      if (data.success == true) {
        setChavePed(data.result.chavePed);
        setCodPro(data.result.codPro);
        setCorPedPro(data.result.corPedPro);
      }
      if (!response.ok) {
        setMensagemPed(data.message || "Erro ao buscar dados do produto do pedido.");
        resetInput(setChavepedpro, inputRefPro);
        return;
      }

      setDadosPedPro(data.result ?? null);
    } catch (err) {
      const msg = "Erro ao pesquisar o pedido, tente novamente.";
      const errorObj = {
        success: false,
        message: msg,
        error: err instanceof Error ? err.message : String(err),
      };
      setMensagemPed(msg);
      resetInput(setChavepedpro, inputRefPro);
      setDadosPedPro(null);
      return errorObj;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitchaveSit() {
    const codigosComData = [
      "0000000042",
      "0000000043",
      "0000000008",
      "0000000009",
      "0000000020",
      "0000000021",
      "0000000022",
      "0000000023",
      "42",
      "43",
      "8",
      "9",
      "20",
      "21",
      "22",
      "23",
    ];

    const conferenciaDeQualidade = ["0000000015", "15"];

    const isConferencia = conferenciaDeQualidade.includes(chaveSit);

    const possuiData = codigosComData.includes(chaveSit);

    setMostrarInputData(possuiData);
    setMaterial(isConferencia);

    if (possuiData || isConferencia) {
      return;
    }

    await fazerSubmitPadrao();
  }

  async function fazerSubmitPadrao() {
    setIsLoading(true);
    try {
      const response = await fetch("../api/situacao", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chavePedPro: chavepedpro, chaveSitPro: chaveSit }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemSit(data.message || "Erro ao atualizar etapa do pedido.");
        resetInput(setChavepedSit, inputRefSit);
        return;
      }

      setFinishMsg(true);
    } catch (err) {
      const errorMessage = "Falha ao atualizar etapa do produto, contate um administrador.";
      const errorObject = {
        success: false,
        message: errorMessage,
      };
      console.error(err);
      console.log({
        success: false,
        message: errorMessage,
        error: errorObject,
      });
      setMensagemSit("Erro ao atualizar situação do produto.");
      resetInput(setChavepedSit, inputRefSit);
    } finally {
      setIsLoading(false);
    }
  }

  async function fazerSubmitLocalDoMaterial() {
    if (!localMaterial) {
      setMensagemSit("Informe o local do material para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("../api/situacao-qualidade", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chavePedPro: chavepedpro,
          chaveSitPro: chaveSit,
          chavePed: chavePed,
          codPro: codPro,
          corPedPro: corPedPro,
          localProduto: localMaterial,
          localEmbalagem: embalagem,
          quantidadeConferida: quantidadeConferida,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemSit(data.message || "Erro ao atualizar etapa do produto com data...");
        resetInput(setChavepedSit, inputRefSit);
        return;
      }
      setFinishMsg(true);
    } catch (err) {
      console.error(err);
      const errorMessage = "Falha ao atualizar etapa do produto, contate um administrador.";
      const errorObject = {
        success: false,
        message: errorMessage,
      };
      console.log({
        success: false,
        message: errorMessage,
        error: errorObject,
      });
      setMensagemSit("Erro ao atualizar situação com data.");
      resetInput(setDataProducao, inputRefSit);
    } finally {
      setIsLoading(false);
    }
  }
  async function fazerSubmitComData() {
    if (!dataProducao) {
      setMensagemSit("Informe uma data para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("../api/situacao-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chavePedPro: chavepedpro,
          chaveSitPro: chaveSit,
          dataProducao: dataProducao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemSit(data.message || "Erro ao atualizar etapa do produto com data...");
        resetInput(setChavepedSit, inputRefSit);
        return;
      }
      setFinishMsg(true);
    } catch (err) {
      console.error(err);
      const errorMessage = "Falha ao atualizar etapa do produto, contate um administrador.";
      const errorObject = {
        success: false,
        message: errorMessage,
      };
      console.log({
        success: false,
        message: errorMessage,
        error: errorObject,
      });
      setMensagemSit("Erro ao atualizar situação com data.");
      resetInput(setDataProducao, inputRefSit);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-screen max-w-[90%] mx-auto xl:max-w-7xl min-h-[70dvh] lg:h-fit max-h-fit lg:min-h-[calc(100vh-120px)] flex flex-col gap-2 bg-white shadow-2xl px-4 py-2 rounded-xl relative">
      <header className="pointer-events-none">
        <div id="userData" className="flex gap-4 items-center py-2 border-b">
          <div className="avatar">
            <div className="w-18 h-18 flex justify-center items-center overflow-hidden shadow-xl bg-[var(--backgroudPage)] rounded-full dark:bg-[var(--backgroudPage)]">
              {!userImg ? (
                <svg
                  className="w-10 h-10 text-gray-100"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="imagem de um avatar"
                  role="img"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              ) : (
                <Image
                  src={userImg}
                  alt="imagem do usuario"
                  width={76}
                  height={76}
                  className="object-cover h-full w-full"
                />
              )}
            </div>
          </div>
          <p className="text-2xl">{userName}</p>
        </div>
      </header>

      {!dadosPedPro ? (
        <div className="flex justify-center items-center gap-8 px-2 py-2 flex-1">
          <form
            className="w-full h-full flex justify-start items-center gap-4"
            onSubmit={(e) => e.preventDefault()}
            autoComplete="off"
          >
            <div className="w-full h-full">
              <h1 className="text-center font-bold text-2xl w-full">ESCANEAR O CÓDIGO DO LAYOUT PARA CONTINUAR</h1>
              <div className="flex flex-col gap-8 mt-8 max-w-3xl mx-auto items-center">
                <InputRoot data-error={mensagemPed.length > 1}>
                  <InputIcon>
                    <ScanBarcode size={36} className="text-blue-500" />
                  </InputIcon>
                  <InputField
                    type="password"
                    placeholder="Leia o codigo da Ordem de serviço"
                    value={chavepedpro}
                    onChange={(e) => setChavepedpro(e.target.value)}
                    onKeyUp={handleKeyUp}
                    autoFocus
                    autoCorrect="off"
                    spellCheck="false"
                    ref={inputRefPro}
                    autoComplete="one-time-code"
                  />
                </InputRoot>
                {mensagemPed && <p className="text-red-500 font-[700] font-poppins">{mensagemPed}</p>}
                {isLoading && (
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
                    <p>Carregando...</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
          {!finishMsg ? (
            // Se houver resultado, mostra os dados do produto
            <>
              <div className="flex flex-col lg:flex-row justify-start items-start gap-2 p-4 flex-1">
                <div className="w-full h-full max-w-[500px]">
                  <Image
                    src={dadosPedPro.pathPedPath || SkeletonLayout}
                    alt="layout do pedido"
                    width={499.2}
                    height={353.6}
                  />
                </div>
                <div className="w-full h-full flex-1 flex flex-col gap-4 text-lg">
                  <p className="font-poppins">
                    CLIENTE: <strong>{dadosPedPro.nomeCliente}</strong>
                  </p>
                  <p className="font-poppins">
                    PRODUTO: <strong>{dadosPedPro.descr2Pro}</strong>
                  </p>
                  <p className="font-poppins">
                    COR: <strong>{dadosPedPro.corPedPro}</strong>
                  </p>
                  <p className="font-poppins">
                    GRAVAÇÃO: <strong>{dadosPedPro.corGravaPedPro}</strong>
                  </p>
                  <p className="font-poppins">
                    QUANTIDADE:·<strong>{Number.parseInt(dadosPedPro.qtdPedPro)}</strong>·peças
                  </p>
                  <div className="mt-4 border-t">
                    <p className="font-poppins">
                      SITUAÇÃO ATUAL: <strong>{dadosPedPro.descrPedProSit}</strong>
                    </p>
                  </div>
                  <form
                    className="w-full max-w-fit flex justify-start items-start gap-4"
                    onSubmit={(e) => e.preventDefault()}
                    autoComplete="off"
                  >
                    <div className="w-full flex items-start">
                      <div className="flex items-start gap-8 w-full">
                        <div className="flex flex-col">
                          <p>Leia o código de barras para registrar</p>
                          <InputRoot data-error={mensagemSit.length > 1}>
                            <InputIcon>
                              <Barcode size={36} className="text-blue-500" />
                            </InputIcon>
                            <InputField
                              type="password"
                              placeholder="Leia o codigo da Ordem de serviço"
                              value={chaveSit}
                              onChange={(e) => setChavepedSit(e.target.value)}
                              onKeyUp={handleKeyUpSit}
                              autoFocus
                              autoCorrect="off"
                              spellCheck="false"
                              autoComplete="one-time-code"
                              ref={inputRefSit}
                            />
                          </InputRoot>
                          {material && (
                            <div className="grid grid-cols-2 w-full gap-4">
                              <div className="flex flex-col w-full">
                                <p className="text-nowrap">Local do Material:</p>
                                <InputRoot data-error={mensagemPed.length > 1}>
                                  <InputField
                                    type="text"
                                    placeholder="Digite o Local do Material"
                                    onChange={(e) => setLocalMaterial(e.target.value)}
                                  />
                                </InputRoot>
                              </div>
                              <div className="flex flex-col w-full">
                                <p className="text-nowrap">Local das Embalagens e Acessorios:</p>
                                <InputRoot data-error={mensagemPed.length > 1}>
                                  <InputField
                                    type="text"
                                    placeholder="Digite o Local das Embalagens e Acessorios"
                                    onChange={(e) => setEmbalagem(e.target.value)}
                                  />
                                </InputRoot>
                              </div>
                              <div className="flex flex-col w-full">
                                <p className="text-nowrap">Quantidade Conferida:</p>
                                <InputRoot data-error={mensagemPed.length > 1}>
                                  <InputField
                                    type="number"
                                    placeholder="0"
                                    onChange={(e) => setQuantidadeConferida(Number(e.target.value))}
                                  />
                                </InputRoot>
                              </div>
                              <button
                                onClick={fazerSubmitLocalDoMaterial}
                                className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-4 self-end rounded mt-4 cursor-pointer compatible_button"
                                type="submit"
                              >
                                Confirmar
                              </button>
                            </div>
                          )}
                          {mensagemSit && <p className="text-red-500 font-[700] font-poppins">{mensagemSit}</p>}
                        </div>

                        {mostrarInputData && (
                          <div className="flex flex-col w-full">
                            <p className="text-nowrap">data prevista de produção:</p>
                            <input
                              type="date"
                              value={dataProducao}
                              onChange={(e) => setDataProducao(e.target.value)}
                              className="w-full flex bg-white h-16 border border-gray-600 rounded-lg px-4 items-center focus-within:border-blue-500 focus-within:border-2 data-[error=true]:border-danger"
                              required
                              min={new Date().toISOString().split("T")[0]}
                            />
                            <button
                              onClick={fazerSubmitComData}
                              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 cursor-pointer compatible_button"
                              type="submit"
                            >
                              Confirmar Data
                            </button>
                          </div>
                        )}

                        {isLoading && (
                          <div className="flex justify-center items-center gap-2 absolute bottom-4">
                            <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold font-poppins">Carregando...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col lg:flex-row justify-start items-start gap-2 p-4 flex-1">
              <div className="w-full h-full max-w-[500px] mx-auto">
                <Image src={successImg} alt="operario feliz com a conclusão das tarefas" />
                {fraseAleatoria && <p className="text-center text-2xl text-gray-600 mt-4 italic">“{fraseAleatoria}”</p>}
                <h1 className="text-2xl text-green-500 font-bold text-center">
                  Situação cadastrada com sucesso! obrigado
                </h1>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
