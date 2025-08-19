"use client";

import { useState, useEffect } from "react";
import PaymentCard from "@/components/cards/PaymentCard";
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  Filter,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { retrieveUserData } from "@/app/utils/retrieveUserData";
import { Payment } from "./interfaces";

export default function PsychologistPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPayments, setConfirmingPayments] = useState<Set<string>>(
    new Set()
  );
  const [filter, setFilter] = useState<
    "todos" | "pendentes" | "recebidos" | "vencidos"
  >("todos");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const profile = await retrieveUserData();
        const paymentsData = (await api.get(
          `/financeiro/psicologo/${profile.id}`
        )) as Payment[];

        setPayments(paymentsData);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar pagamentos");
        console.error("Erro ao buscar pagamentos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Função para confirmar pagamento
  const handleConfirmPayment = async (paymentId: string) => {
    try {
      setConfirmingPayments((prev) => new Set(prev).add(paymentId));

      await api.patch(`/financeiro/status/${paymentId}`, {
        paid: true,
      });

      // Recarregar dados após confirmar pagamento
      const profile = await retrieveUserData();
      const paymentsData = (await api.get(
        `/financeiro/psicologo/${profile.id}`
      )) as Payment[];

      setPayments(paymentsData);
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
      setError("Erro ao confirmar pagamento");
    } finally {
      setConfirmingPayments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  // Filtrar pagamentos
  const filteredPayments = payments.filter((payment) => {
    const now = new Date();
    const dueDate = new Date(payment.dataVencimento);

    switch (filter) {
      case "pendentes":
        return payment.status === "Pendente" && dueDate >= now;
      case "recebidos":
        return payment.status === "Pago";
      case "vencidos":
        return payment.status === "Pendente" && dueDate < now;
      case "todos":
      default:
        return true;
    }
  });

  // Ordenar pagamentos (vencidos primeiro, depois por data de vencimento)
  const sortedPayments = filteredPayments.sort((a, b) => {
    const now = new Date();
    const dueDateA = new Date(a.dataVencimento);
    const dueDateB = new Date(b.dataVencimento);

    // Se ambos são vencidos ou ambos não são vencidos, ordena por data de vencimento
    const aIsOverdue = a.status === "Pendente" && dueDateA < now;
    const bIsOverdue = b.status === "Pendente" && dueDateB < now;

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Se status são iguais, ordena por data de vencimento
    if (filter === "recebidos") {
      return new Date(b.data).getTime() - new Date(a.data).getTime(); // Mais recentes primeiro
    }

    return dueDateA.getTime() - dueDateB.getTime(); // Vencimento mais próximo primeiro
  });

  // Contar pagamentos por categoria
  const now = new Date();
  const counts = {
    todos: payments.length,
    pendentes: payments.filter(
      (p) => p.status === "Pendente" && new Date(p.dataVencimento) >= now
    ).length,
    recebidos: payments.filter((p) => p.status === "Pago").length,
    vencidos: payments.filter(
      (p) => p.status === "Pendente" && new Date(p.dataVencimento) < now
    ).length,
  };

  // Calcular totais
  const totalRecebido = payments
    .filter((p) => p.status === "Pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = payments
    .filter((p) => p.status === "Pendente")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalVencido = payments
    .filter((p) => p.status === "Pendente" && new Date(p.dataVencimento) < now)
    .reduce((sum, p) => sum + p.valor, 0);

  // Calcular receita do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const receitaMesAtual = payments
    .filter((p) => {
      const paymentDate = new Date(p.data);
      return (
        p.status === "Pago" &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, p) => sum + p.valor, 0);

  // Configuração dos filtros
  const filterOptions = [
    { key: "todos", label: "Todos", count: counts.todos, icon: DollarSign },
    {
      key: "pendentes",
      label: "Pendentes",
      count: counts.pendentes,
      icon: Clock,
    },
    {
      key: "recebidos",
      label: "Recebidos",
      count: counts.recebidos,
      icon: CheckCircle,
    },
    {
      key: "vencidos",
      label: "Vencidos",
      count: counts.vencidos,
      icon: AlertTriangle,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Pagamentos a Receber
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Consulte e acompanhe os pagamentos dos seus pacientes
          </p>
        </div>
        <div className="flex justify-center items-center h-48 md:h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm md:text-base text-gray-600">
              Carregando pagamentos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Pagamentos a Receber
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Consulte e acompanhe os pagamentos dos seus pacientes
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium text-sm md:text-base">
            Erro ao carregar pagamentos
          </p>
          <p className="text-xs md:text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Pagamentos a Receber
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Consulte e acompanhe os pagamentos dos seus pacientes
            </p>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Recebido
                </p>
                <p className="text-lg font-semibold text-green-800">
                  {formatCurrency(totalRecebido)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">A Receber</p>
                <p className="text-lg font-semibold text-yellow-800">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Em Atraso</p>
                <p className="text-lg font-semibold text-red-800">
                  {formatCurrency(totalVencido)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Receita do Mês
                </p>
                <p className="text-lg font-semibold text-blue-800">
                  {formatCurrency(receitaMesAtual)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtro Mobile - Botão Toggle */}
        <div className="sm:hidden mt-6">
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
                  setFilter(
                    key as "todos" | "pendentes" | "recebidos" | "vencidos"
                  );
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
        <div className="hidden sm:flex space-x-2 mt-6">
          {filterOptions.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() =>
                setFilter(
                  key as "todos" | "pendentes" | "recebidos" | "vencidos"
                )
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

      {/* Lista de pagamentos */}
      {sortedPayments.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
            {filter === "todos" && "Nenhum pagamento encontrado"}
            {filter === "pendentes" && "Nenhum pagamento pendente"}
            {filter === "recebidos" && "Nenhum pagamento recebido"}
            {filter === "vencidos" && "Nenhum pagamento vencido"}
          </h3>
          <p className="text-sm md:text-base text-gray-600 px-4">
            {filter === "todos" &&
              "Pagamentos dos seus pacientes aparecerão aqui quando houver consultas agendadas."}
            {filter === "pendentes" &&
              "Pagamentos pendentes de pacientes aparecerão aqui."}
            {filter === "recebidos" &&
              "Seu histórico de pagamentos recebidos aparecerá aqui."}
            {filter === "vencidos" &&
              "Pagamentos em atraso de pacientes aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {sortedPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              userRole="psychologist"
              onConfirmPayment={handleConfirmPayment}
              isConfirming={confirmingPayments.has(payment.id)}
            />
          ))}
        </div>
      )}

      {/* Summary fixo no mobile */}
      {sortedPayments.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filter === "todos" && `${counts.todos} pagamentos`}
              {filter === "pendentes" && `${counts.pendentes} pendentes`}
              {filter === "recebidos" && `${counts.recebidos} recebidos`}
              {filter === "vencidos" && `${counts.vencidos} vencidos`}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-800 font-medium">
                Total:{" "}
                {formatCurrency(
                  filteredPayments.reduce((sum, p) => sum + p.valor, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
