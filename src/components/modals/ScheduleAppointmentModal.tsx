import React, { useState, useEffect, useCallback } from "react";
import { X, Calendar, User } from "lucide-react";
import { api } from "../../lib/api";
import { retrieveUserData } from "../../app/utils/retrieveUserData";

interface Psicologo {
  id: string;
  nome: string;
  crp: string;
  email: string;
  telefone: string;
  endereco: string;
  numero: number;
}

interface AtendimentoDisponivel {
  id: string;
  data: string;
  observacoes?: string;
  descricao: string;
  psicologoId: string;
  psicologo: Psicologo;
  valor: number;
}

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistInfo?: {
    id: string;
    nome: string;
    crp: string;
  };
  psicologoId?: string;
  pacienteId?: string;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  psychologistInfo,
  psicologoId,
  pacienteId,
}) => {
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [atendimentosDisponiveis, setAtendimentosDisponiveis] = useState<
    AtendimentoDisponivel[]
  >([]);
  const [atendimentoSelecionado, setAtendimentoSelecionado] =
    useState<AtendimentoDisponivel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPacienteId, setCurrentPacienteId] = useState<string>("");

  const currentPsicologoId = psychologistInfo?.id || psicologoId;

  const carregarAtendimentosDisponiveis = useCallback(async () => {
    if (!currentPsicologoId) return;

    try {
      setLoading(true);
      const response = (await api.get(
        `/consultas/disponiveis/psicologo/${currentPsicologoId}`
      )) as AtendimentoDisponivel[];
      setAtendimentosDisponiveis(response);
    } catch (err) {
      setError("Erro ao carregar atendimentos disponíveis");
      console.error("Erro ao carregar atendimentos:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPsicologoId]);

  useEffect(() => {
    if (isOpen) {
      carregarAtendimentosDisponiveis();
      // Carregar dados do paciente se não foi passado por prop
      if (!pacienteId) {
        carregarDadosPaciente();
      } else {
        setCurrentPacienteId(pacienteId);
      }
    }
  }, [isOpen, currentPsicologoId, carregarAtendimentosDisponiveis, pacienteId]);

  const carregarDadosPaciente = async () => {
    try {
      const userData = await retrieveUserData();
      setCurrentPacienteId(userData.id);
    } catch (err) {
      console.error("Erro ao carregar dados do paciente:", err);
      setError("Erro ao carregar dados do usuário");
    }
  };

  const selecionarAtendimento = (atendimento: AtendimentoDisponivel) => {
    setAtendimentoSelecionado(atendimento);
    setStep("confirm");
  };

  const confirmarAgendamento = async () => {
    if (!atendimentoSelecionado || !currentPacienteId) return;

    try {
      setLoading(true);
      console.log("Agendando consulta com dados:", {
        availableConsultationId: atendimentoSelecionado.id,
        pacienteId: currentPacienteId,
        observacoes: atendimentoSelecionado.observacoes || undefined,
      });

      await api.post("/consultas/agendar", {
        availableConsultationId: atendimentoSelecionado.id,
        pacienteId: currentPacienteId,
        observacoes: atendimentoSelecionado.observacoes || undefined,
      });

      setStep("success");
    } catch (err) {
      setError("Erro ao agendar consulta");
      console.error("Erro ao agendar consulta:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("select");
    setAtendimentoSelecionado(null);
    setError(null);
    if (!pacienteId) {
      setCurrentPacienteId("");
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (step) {
      case "select":
        return "Selecionar Atendimento";
      case "confirm":
        return "Confirmar Agendamento";
      case "success":
        return "Agendamento Confirmado";
      default:
        return "Agendar Consulta";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={resetModal}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {getStepTitle()}
          </h2>
          <button
            onClick={resetModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Seleção de Atendimento */}
          {step === "select" && (
            <div>
              <div className="mb-4">
                <p className="text-gray-700">
                  Selecione um dos atendimentos disponíveis abaixo:
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {atendimentosDisponiveis.map((atendimento) => (
                    <div
                      key={atendimento.id}
                      className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => selecionarAtendimento(atendimento)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-800">
                              {atendimento.psicologo.nome}
                            </span>
                            <span className="text-sm text-gray-600">
                              CRP: {atendimento.psicologo.crp}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              {formatDate(atendimento.data)}
                            </span>
                          </div>

                          {atendimento.descricao && (
                            <p className="text-sm text-gray-600 mt-2">
                              {atendimento.descricao}
                            </p>
                          )}

                          {atendimento.observacoes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {atendimento.observacoes}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-green-600 font-semibold">
                            <span>{formatCurrency(atendimento.valor)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {atendimentosDisponiveis.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-600">
                      Nenhum atendimento disponível no momento.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirmação do Agendamento */}
          {step === "confirm" && atendimentoSelecionado && (
            <div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-3 text-gray-800">
                  Resumo do Atendimento
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Psicólogo:</span>
                    <span className="text-gray-800">
                      {atendimentoSelecionado.psicologo.nome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Data e Hora:</span>
                    <span className="text-gray-800">
                      {formatDate(atendimentoSelecionado.data)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Descrição:</span>
                    <span className="text-gray-800">
                      {atendimentoSelecionado.descricao}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">Valor:</span>
                    <span className="text-gray-800">
                      {formatCurrency(atendimentoSelecionado.valor)}
                    </span>
                  </div>
                  {atendimentoSelecionado.observacoes && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Observações:</span>
                      <span className="text-gray-800">
                        {atendimentoSelecionado.observacoes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setStep("select")}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmarAgendamento}
                  disabled={loading || !currentPacienteId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span>Confirmar Agendamento</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmação de Sucesso */}
          {step === "success" && atendimentoSelecionado && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Agendamento Confirmado!
              </h3>

              <p className="text-gray-700 mb-6">
                Seu atendimento foi agendado com sucesso. Você receberá uma
                confirmação por email em breve.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium mb-3 text-gray-800">
                  Detalhes do Agendamento
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Psicólogo:</span>
                    <span className="text-gray-800">
                      {atendimentoSelecionado.psicologo.nome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Data e Hora:</span>
                    <span className="text-gray-800">
                      {formatDate(atendimentoSelecionado.data)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Descrição:</span>
                    <span className="text-gray-800">
                      {atendimentoSelecionado.descricao}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Valor:</span>
                    <span className="text-gray-800">
                      {formatCurrency(atendimentoSelecionado.valor)}
                    </span>
                  </div>
                  {atendimentoSelecionado.observacoes && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Observações:</span>
                      <span className="text-gray-800 text-right max-w-xs">
                        {atendimentoSelecionado.observacoes}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <span className="text-green-600 font-medium">
                      ✅ Confirmado
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
