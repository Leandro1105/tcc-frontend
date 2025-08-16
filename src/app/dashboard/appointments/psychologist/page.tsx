"use client";

import { useState, useEffect } from "react";
import {
  Edit3,
  Calendar,
  Clock,
  CheckCircle,
  Filter,
  Trash2,
} from "lucide-react";
import PsychologistAppointmentModal from "@/components/modals/PsychologistAppointmentModal";
import { Atendimento, AtendimentoDisponivel } from "./interfaces";
import { retrieveUserData } from "@/app/utils/retrieveUserData";
import { api } from "@/lib/api";

export default function PsychologistAppointmentsPage() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [atendimentosDisponiveis, setAtendimentosDisponiveis] = useState<
    AtendimentoDisponivel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "disponiveis" | "proximos" | "concluidos"
  >("disponiveis");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit-available" | "edit-scheduled"
  >("create");
  const [editingAppointment, setEditingAppointment] = useState<{
    id: string;
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const profile = await retrieveUserData();
      const appointments = (await api.get(
        `/consultas/psicologo/${profile.id}`
      )) as Atendimento[];

      const availableAppointments = (await api.get(
        `/consultas/disponiveis/psicologo/${profile.id}`
      )) as AtendimentoDisponivel[];

      setAtendimentos(appointments);
      setAtendimentosDisponiveis(availableAppointments);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleCreate = () => {
    setModalMode("create");
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  const handleEditAppointment = (atendimento: Atendimento) => {
    setEditingAppointment({
      id: atendimento.id,
      data: formatDateForInput(atendimento.data),
      observacoes: atendimento.observacoes,
      valor: 150,
      descricao: atendimento.paciente
        ? `Consulta com ${atendimento.paciente.nome}`
        : "Horário disponível",
    });
    setModalMode("edit-scheduled");
    setShowModal(true);
  };

  const handleEditAvailableAppointment = (
    atendimento: AtendimentoDisponivel
  ) => {
    setEditingAppointment({
      id: atendimento.id,
      data: formatDateForInput(atendimento.data),
      observacoes: atendimento.observacoes || "",
      valor: atendimento.valor || 0,
      descricao: atendimento.descricao,
    });
    setModalMode("edit-available");
    setShowModal(true);
  };

  const handleAddAppointment = async (data: {
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  }) => {
    try {
      const profile = await retrieveUserData();

      await api.post("/consultas", {
        data: data.data,
        descricao: data.descricao,
        observacoes: data.observacoes,
        valor: data.valor,
        psicologoId: profile.id,
      });

      const availableAppointments = (await api.get(
        `/consultas/disponiveis/psicologo/${profile.id}`
      )) as AtendimentoDisponivel[];

      setAtendimentosDisponiveis(availableAppointments);
    } catch (error) {
      console.error("Erro ao criar atendimento:", error);
    }
  };

  const handleModalSubmit = async (data: {
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  }) => {
    if (modalMode === "create") {
      await handleAddAppointment(data);
    } else {
      await handleUpdateAppointment(data);
    }
  };

  const handleUpdateAppointment = async (data: {
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  }) => {
    if (!editingAppointment) return;

    try {
      const profile = await retrieveUserData();

      const isAvailableAppointment = atendimentosDisponiveis.some(
        (item) => item.id === editingAppointment.id
      );

      if (isAvailableAppointment) {
        await api.patch(`/consultas/disponiveis/${editingAppointment.id}`, {
          data: data.data,
          descricao: data.descricao,
          observacoes: data.observacoes,
          valor: data.valor,
        });

        // Recarregar a lista de atendimentos disponíveis
        const availableAppointments = (await api.get(
          `/consultas/disponiveis/psicologo/${profile.id}`
        )) as AtendimentoDisponivel[];

        setAtendimentosDisponiveis(availableAppointments);
      } else {
        // Editar atendimento agendado
        await api.patch(`/consultas/${editingAppointment.id}`, {
          data: data.data,
          observacoes: data.observacoes,
        });

        // Recarregar a lista de atendimentos agendados
        const appointments = (await api.get(
          `/consultas/psicologo/${profile.id}`
        )) as Atendimento[];

        setAtendimentos(appointments);
      }
    } catch (error) {
      console.error("Erro ao atualizar atendimento:", error);
      // Aqui você pode adicionar uma notificação de erro se desejar
    }
  };

  const handleDeleteAvailableAppointment = async (id: string) => {
    try {
      const profile = await retrieveUserData();

      await api.delete(`/consultas/disponiveis/${id}`);

      // Recarregar a lista de atendimentos disponíveis
      const availableAppointments = (await api.get(
        `/consultas/disponiveis/psicologo/${profile.id}`
      )) as AtendimentoDisponivel[];

      setAtendimentosDisponiveis(availableAppointments);
    } catch (error) {
      console.error("Erro ao excluir atendimento disponível:", error);
      // Aqui você pode adicionar uma notificação de erro se desejar
    }
  };

  const handleDeleteScheduledAppointment = async (id: string) => {
    try {
      const profile = await retrieveUserData();

      await api.delete(`/consultas/${id}`);

      // Recarregar a lista de atendimentos agendados
      const appointments = (await api.get(
        `/consultas/psicologo/${profile.id}`
      )) as Atendimento[];

      setAtendimentos(appointments);
    } catch (error) {
      console.error("Erro ao excluir atendimento agendado:", error);
      // Aqui você pode adicionar uma notificação de erro se desejar
    }
  };

  // Função para determinar se o atendimento é próximo (nas próximas 24h)
  const isUpcoming = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    const diffHours =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  // Separar e filtrar dados por categoria
  const now = new Date();

  // Atendimentos agendados (com paciente) próximos
  const proximosAtendimentos = atendimentos.filter(
    (atendimento) => atendimento.paciente && new Date(atendimento.data) >= now
  );

  // Atendimentos agendados (com paciente) concluídos
  const atendimentosConcluidos = atendimentos.filter(
    (atendimento) => atendimento.paciente && new Date(atendimento.data) < now
  );

  // Função para obter dados filtrados
  const getFilteredData = () => {
    switch (filter) {
      case "disponiveis":
        return atendimentosDisponiveis.sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
        );
      case "proximos":
        return proximosAtendimentos.sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
        );
      case "concluidos":
        return atendimentosConcluidos.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  // Contar itens por categoria
  const counts = {
    disponiveis: atendimentosDisponiveis.length,
    proximos: proximosAtendimentos.length,
    concluidos: atendimentosConcluidos.length,
  };

  // Configuração dos filtros
  const filterOptions = [
    {
      key: "disponiveis",
      label: "Disponíveis",
      count: counts.disponiveis,
      icon: Calendar,
    },
    { key: "proximos", label: "Próximos", count: counts.proximos, icon: Clock },
    {
      key: "concluidos",
      label: "Concluídos",
      count: counts.concluidos,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Meus Atendimentos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie seus horários disponíveis e consultas agendadas
            </p>
          </div>

          {/* Botão Novo Atendimento */}
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
            onClick={handleCreate}
          >
            Novo Atendimento
          </button>
        </div>

        {/* Filtro Mobile - Botão Toggle */}
        <div className="sm:hidden mt-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium w-full justify-center"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {counts[filter]}
            </span>
          </button>
        </div>

        {/* Filtros Mobile - Dropdown */}
        {showMobileFilters && (
          <div className="mt-4 space-y-2 sm:hidden">
            {filterOptions.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key as "disponiveis" | "proximos" | "concluidos");
                  setShowMobileFilters(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    filter === key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Filtros Desktop */}
        <div className="hidden sm:flex space-x-2 mt-4">
          {filterOptions.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() =>
                setFilter(key as "disponiveis" | "proximos" | "concluidos")
              }
              className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                filter === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
              <span className="md:hidden">{label.charAt(0)}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal unificado */}
      <PsychologistAppointmentModal
        open={showModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        appointment={editingAppointment}
        mode={modalMode}
      />

      {loading ? (
        <div className="flex justify-center items-center h-48 md:h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm md:text-base text-gray-600">
              Carregando seus atendimentos...
            </p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
            {filter === "disponiveis" && "Nenhum horário disponível"}
            {filter === "proximos" && "Nenhum atendimento próximo"}
            {filter === "concluidos" && "Nenhum atendimento concluído"}
          </h3>
          <p className="text-sm md:text-base text-gray-600 px-4">
            {filter === "disponiveis" &&
              "Crie horários disponíveis para que pacientes possam agendar."}
            {filter === "proximos" &&
              "Suas próximas consultas aparecerão aqui."}
            {filter === "concluidos" &&
              "Seu histórico de consultas aparecerá aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredData.map((item) => {
            // Verificar se é um atendimento disponível ou agendado
            const isAvailable = "psicologo" in item;
            const upcoming = !isAvailable && isUpcoming(item.data);

            return (
              <div key={item.id} className="relative">
                {upcoming && (
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 z-10">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                      Em breve
                    </span>
                  </div>
                )}
                <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition-shadow duration-200">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-800">
                      {isAvailable
                        ? `Horário Disponível - ${item.descricao}`
                        : `Consulta com ${
                            (item as Atendimento).paciente?.nome || "Paciente"
                          }`}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {new Date(item.data).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {item.observacoes}
                    </div>
                    {!isAvailable && (item as Atendimento).paciente && (
                      <div className="text-xs text-gray-500 mt-1">
                        Paciente: {(item as Atendimento).paciente!.nome} (
                        {(item as Atendimento).paciente!.email})
                      </div>
                    )}
                    {isAvailable && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Disponível para agendamento
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0 relative z-20">
                    {isAvailable ? (
                      <>
                        <button
                          onClick={() =>
                            handleEditAvailableAppointment(
                              item as AtendimentoDisponivel
                            )
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium text-sm min-w-[44px] min-h-[44px]"
                          title="Editar horário disponível"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAvailableAppointment(item.id);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium text-sm min-w-[44px] min-h-[44px]"
                          title="Excluir horário disponível"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            handleEditAppointment(item as Atendimento)
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium text-sm min-w-[44px] min-h-[44px]"
                          title="Editar atendimento"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteScheduledAppointment(item.id);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium text-sm min-w-[44px] min-h-[44px]"
                          title="Excluir atendimento agendado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary fixo no mobile */}
      {filteredData.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filter === "disponiveis" && `${counts.disponiveis} disponíveis`}
              {filter === "proximos" && `${counts.proximos} próximos`}
              {filter === "concluidos" && `${counts.concluidos} concluídos`}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-800 font-medium">
                Total: {filteredData.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
