"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import {
  LoginPayload,
  LoginResponse,
  PatientRegisterPayload,
  PsychologistRegisterPayload,
  RegisterResponse,
} from "./interfaces";

type UserType = "patient" | "psychologist";
type AuthMode = "login" | "register";

export default function AuthPage() {
  const [userType, setUserType] = useState<UserType>("patient");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crp, setCrp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [termoAceito, setTermoAceito] = useState(false);
  const [showTermo, setShowTermo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const clearForm = () => {
    setEmail("");
    setSenha("");
    setNome("");
    setConfirmSenha("");
    setCpf("");
    setTelefone("");
    setCrp("");
    setEndereco("");
    setNumero("");
    setDataNascimento("");
    setTermoAceito(false);
    setError(null);
  };
  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    clearForm();
  };

  const handleLogin = async () => {
    const payload: LoginPayload = { username: email, password: senha };
    const response = await api.post<LoginResponse, LoginPayload>(
      "/login",
      payload
    );
    console.log("Login response:", response);
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      router.push("/dashboard");
    } else {
      throw new Error("Login successful, but no access token received.");
    }
  };

  const handleRegister = async () => {
    if (senha !== confirmSenha) throw new Error("As senhas não coincidem.");
    if (!termoAceito)
      throw new Error("Você deve aceitar o termo de responsabilidade.");

    let endpoint: string;
    let payload: PatientRegisterPayload | PsychologistRegisterPayload;
    if (userType === "patient") {
      endpoint = "/pacientes";
      payload = {
        nome,
        email,
        senha,
        cpf,
        telefone,
        dataNascimento: new Date(dataNascimento).toISOString(),
      };
    } else {
      endpoint = "/psicologos";
      payload = {
        nome,
        email,
        senha,
        cpf,
        telefone,
        crp,
        endereco,
        numero: parseInt(numero) || 0,
      };
    }
    await api.post<RegisterResponse, typeof payload>(endpoint, payload);
    alert("Cadastro realizado com sucesso! Faça o login.");
    setAuthMode("login");
    clearForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authMode === "login") await handleLogin();
      else await handleRegister();
    } catch {
      setError(
        `Ocorreu um erro durante o ${
          authMode === "login" ? "login" : "cadastro"
        }. Tente novamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-white">
      {/* Left Side: Illustration with light blue background */}
      <div className="hidden lg:flex w-1/2 h-screen relative bg-blue-50">
        <Image
          src="/auth-image.png"
          alt="Ilustração de Autenticação"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side: Form Area with white background */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-left text-3xl font-bold text-gray-900">
            {authMode === "login" ? "Entrar" : "Cadastrar"}
          </h1>

          {/* User Type Selection (Register only - Minimal Style) */}
          {authMode === "register" && (
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-700 mb-3">
                Cadastro como:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Patient Option */}
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="patient"
                    checked={userType === "patient"}
                    onChange={() => setUserType("patient")}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                      ${
                        userType === "patient"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {/* Patient Icon */}
                    <svg
                      className={`w-5 h-5 mb-1.5 ${
                        userType === "patient"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-xs font-medium">Paciente</span>
                    {userType === "patient" && (
                      <div className="absolute top-1.5 right-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </label>

                {/* Psychologist Option */}
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="psychologist"
                    checked={userType === "psychologist"}
                    onChange={() => setUserType("psychologist")}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                      ${
                        userType === "psychologist"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {/* Psychologist Icon */}
                    <svg
                      className={`w-5 h-5 mb-1.5 ${
                        userType === "psychologist"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span className="text-xs font-medium">Psicólogo</span>
                    {userType === "psychologist" && (
                      <div className="absolute top-1.5 right-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* --- Auth Form (Cleaned Inputs/Button based on new image) --- */}
          <form
            onSubmit={handleSubmit}
            className={`${authMode === "register" ? "space-y-3" : "space-y-5"}`}
          >
            {/* Registration Fields */}
            {authMode === "register" && (
              <>
                <CleanInput
                  label="Nome Completo"
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={setNome}
                  required
                  disabled={loading}
                />
                <CleanInput
                  label="CPF"
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={setCpf}
                  required
                  disabled={loading}
                />
                <CleanInput
                  label="Telefone"
                  type="tel"
                  id="telefone"
                  value={telefone}
                  onChange={setTelefone}
                  required
                  disabled={loading}
                />
                {userType === "patient" && (
                  <CleanInput
                    label="Data de Nascimento"
                    type="date"
                    id="dataNascimento"
                    value={dataNascimento}
                    onChange={setDataNascimento}
                    required
                    disabled={loading}
                  />
                )}
                {userType === "psychologist" && (
                  <>
                    <CleanInput
                      label="CRP"
                      type="text"
                      id="crp"
                      value={crp}
                      onChange={setCrp}
                      required
                      disabled={loading}
                    />
                    <CleanInput
                      label="Endereço"
                      type="text"
                      id="endereco"
                      value={endereco}
                      onChange={setEndereco}
                      required
                      disabled={loading}
                    />
                    <CleanInput
                      label="Número"
                      type="number"
                      id="numero"
                      value={numero}
                      onChange={setNumero}
                      required
                      disabled={loading}
                    />
                  </>
                )}
              </>
            )}

            {/* Common Fields */}
            <CleanInput
              label="E-mail"
              type="email"
              id="email"
              value={email}
              onChange={setEmail}
              required
              disabled={loading}
            />
            <CleanInput
              label="Senha"
              type="password"
              id="senha"
              value={senha}
              onChange={setSenha}
              required
              disabled={loading}
            />

            {/* Confirm Password (Register only) */}
            {authMode === "register" && (
              <CleanInput
                label="Confirmar Senha"
                type="password"
                id="confirmSenha"
                value={confirmSenha}
                onChange={setConfirmSenha}
                required
                disabled={loading}
              />
            )}

            {/* Error Message */}
            {error && (
              <p className="text-xs text-red-600 text-center pt-1">{error}</p>
            )}

            {/* Terms and Conditions (Register only) */}
            {authMode === "register" && (
              <div className="pt-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="termoAceito"
                    checked={termoAceito}
                    onChange={(e) => setTermoAceito(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label
                    htmlFor="termoAceito"
                    className="text-sm text-gray-700"
                  >
                    Li e aceito o{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermo(true)}
                      className="text-blue-600 hover:underline font-medium"
                      disabled={loading}
                    >
                      termo de responsabilidade
                    </button>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button (Reduced margin for registration) */}
            <div className={`${authMode === "register" ? "pt-1" : "pt-2"}`}>
              <button
                type="submit"
                className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Processando..."
                  : authMode === "login"
                  ? "Entrar"
                  : "Cadastrar"}
              </button>
            </div>
          </form>
          {/* ------------------------------------------------------------- */}

          {/* Toggle Auth Mode (Reduced margin for registration) */}
          <p
            className={`text-center text-sm text-gray-600 ${
              authMode === "register" ? "mt-3" : "mt-6"
            }`}
          >
            {authMode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={toggleAuthMode}
              className="font-medium text-blue-600 hover:underline focus:outline-none"
              disabled={loading}
            >
              {authMode === "login" ? "Cadastrar" : "Entrar"}
            </button>
          </p>
          {/* ------------------------------------------------------------- */}
        </div>
      </div>

      {/* Modal do Termo de Responsabilidade */}
      {showTermo && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Termo de Não Responsabilidade Clínica
                </h2>
                <button
                  onClick={() => setShowTermo(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4">
                <p>
                  Este sistema tem como objetivo fornecer suporte organizacional
                  e auxiliar na comunicação e acompanhamento entre psicólogos e
                  pacientes, por meio de funcionalidades como registro de humor,
                  atividades diárias, histórico de atendimentos e controle
                  financeiro.
                </p>
                <div>
                  <p className="font-semibold mb-2">ATENÇÃO:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Esta plataforma não realiza diagnósticos, tratamentos ou
                      intervenções psicológicas ou psiquiátricas.
                    </li>
                    <li>
                      O uso deste sistema não substitui, em nenhuma hipótese, o
                      acompanhamento profissional presencial ou remoto realizado
                      por psicólogos devidamente habilitados.
                    </li>
                    <li>
                      Todas as informações inseridas pelos usuários são de uso
                      exclusivo do profissional da saúde responsável pelo
                      acompanhamento, cabendo a ele(a) interpretar, validar e
                      utilizar os dados conforme sua prática clínica.
                    </li>
                    <li>
                      O sistema não possui qualquer responsabilidade sobre
                      condutas clínicas, diagnósticos, decisões terapêuticas ou
                      efeitos resultantes do uso das informações aqui
                      registradas.
                    </li>
                    <li>
                      As informações confidenciais são protegidas de acordo com
                      a Lei Geral de Proteção de Dados (LGPD - Lei nº
                      13.709/2018) e usadas somente com o consentimento do
                      usuário.
                    </li>
                    <li>
                      O sistema é um instrumento auxiliar e deve ser utilizado
                      sob responsabilidade exclusiva dos profissionais
                      habilitados e dos próprios usuários.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTermo(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  disabled={loading}
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setTermoAceito(true);
                    setShowTermo(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  disabled={loading}
                >
                  Aceitar Termo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Reusable Input Component for the new Cleaner Style ---
interface CleanInputProps {
  label: string;
  type: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

function CleanInput({
  label,
  type,
  id,
  value,
  onChange,
  required = false,
  disabled = false,
}: CleanInputProps) {
  return (
    <div>
      {/* Label is now used as placeholder, but kept for accessibility */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={label} // Use label as placeholder
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Style matching the reference image: simple border, padding
        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      />
    </div>
  );
}
// ----------------------------------------------------------
