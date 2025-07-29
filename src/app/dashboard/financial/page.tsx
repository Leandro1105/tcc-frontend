"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { retrieveUserData } from "@/app/utils/retrieveUserData";
import { FinancialSummary, Pagamento } from "./interfaces";

export default function FinancialReportsPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    receitaTotal: 0,
    receitaMensal: 0,
    receitaSemanalMedia: 0,
    totalConsultas: 0,
    valorMedioConsulta: 0,
    consultasMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const profile = await retrieveUserData();
        const payments = (await api.get(
          `/financeiro/psicologo/${profile.id}`
        )) as Pagamento[];

        setPagamentos(payments);
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (pagamentos.length === 0) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const receitaTotal = pagamentos.reduce((sum, p) => sum + p.valor, 0);

    const receitaMensal = pagamentos
      .filter((p) => {
        const paymentDate = new Date(p.data);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, p) => sum + p.valor, 0);

    const consultasMes = pagamentos.filter((p) => {
      const paymentDate = new Date(p.data);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    }).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentPayments = pagamentos.filter((p) => {
      const paymentDate = new Date(p.data);
      return paymentDate >= thirtyDaysAgo;
    });

    const receitaSemanalMedia =
      recentPayments.reduce((sum, p) => sum + p.valor, 0) / 4;

    setSummary({
      receitaTotal,
      receitaMensal,
      receitaSemanalMedia,
      totalConsultas: pagamentos.length,
      valorMedioConsulta: receitaTotal / pagamentos.length || 0,
      consultasMes,
    });
  }, [pagamentos]);

  const monthlyRevenue = React.useMemo(() => {
    if (pagamentos.length === 0) return [];

    const monthlyData: {
      [key: string]: { receita: number; consultas: number };
    } = {};

    // Filtrar apenas os últimos 6 meses para uma melhor visualização
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    pagamentos.forEach((pagamento) => {
      const date = new Date(pagamento.data);

      // Só incluir dados dos últimos 6 meses
      if (date >= sixMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { receita: 0, consultas: 0 };
        }
        monthlyData[monthKey].receita += pagamento.valor;
        monthlyData[monthKey].consultas += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        }),
        monthKey: month,
        receita: data.receita,
        consultas: data.consultas,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [pagamentos]);

  const patientDistribution = React.useMemo(() => {
    if (pagamentos.length === 0) return [];

    const patientData: {
      [key: string]: { consultas: number; receita: number };
    } = {};

    pagamentos.forEach((pagamento) => {
      const patientName =
        pagamento.atendimento?.paciente?.nome || "Nome não disponível";

      if (!patientData[patientName]) {
        patientData[patientName] = { consultas: 0, receita: 0 };
      }

      patientData[patientName].consultas += 1;
      patientData[patientName].receita += pagamento.valor;
    });

    return Object.entries(patientData)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        consultas: data.consultas,
        receita: data.receita,
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 5);
  }, [pagamentos]);

  const weeklyRevenue = React.useMemo(() => {
    if (pagamentos.length === 0) return [];

    const weeklyData: { [key: string]: number } = {};

    // Filtrar apenas as últimas 6 semanas
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42); // 6 semanas

    pagamentos.forEach((pagamento) => {
      const date = new Date(pagamento.data);

      // Só incluir dados das últimas 6 semanas
      if (date >= sixWeeksAgo) {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + pagamento.valor;
      }
    });

    return Object.entries(weeklyData)
      .map(([week, revenue]) => ({
        semana: new Date(week).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        weekKey: week,
        receita: revenue,
      }))
      .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  }, [pagamentos]);

  const dailyConsultations = React.useMemo(() => {
    if (pagamentos.length === 0) return [];

    const dailyData: { [key: string]: number } = {};

    // Filtrar apenas os últimos 14 dias
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    pagamentos.forEach((pagamento) => {
      const date = new Date(pagamento.data);

      // Só incluir dados dos últimos 14 dias
      if (date >= fourteenDaysAgo) {
        const dayKey = date.toISOString().split("T")[0];
        dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
      }
    });

    return Object.entries(dailyData)
      .map(([day, count]) => ({
        dia: new Date(day).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        dayKey: day,
        consultas: count,
      }))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }, [pagamentos]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600">
            Carregando relatórios financeiros...
          </span>
        </div>
      </div>
    );
  }

  if (!loading && pagamentos.length === 0) {
    return (
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Relatórios Financeiros
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Acompanhe suas receitas e performance de consultas
          </p>
        </div>
        <div className="flex flex-col justify-center items-center h-40 bg-white rounded-lg shadow mt-6">
          <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum dado financeiro encontrado
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Ainda não há registros de pagamentos para exibir relatórios.
            <br />
            Os dados aparecerão aqui após as primeiras consultas serem
            registradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Relatórios Financeiros
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Acompanhe suas receitas e performance de consultas
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">
                R${" "}
                {summary.receitaTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Receita Mensal
              </p>
              <p className="text-2xl font-bold text-blue-600">
                R${" "}
                {summary.receitaMensal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Semanal</p>
              <p className="text-2xl font-bold text-purple-600">
                R${" "}
                {summary.receitaSemanalMedia.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Consultas Totais
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {summary.totalConsultas}
              </p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Consultas este Mês
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {summary.consultasMes}
              </p>
            </div>
            <CalendarDays className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-2xl font-bold text-teal-600">
                R${" "}
                {summary.valorMedioConsulta.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Clock className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita Mensal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Receita Mensal (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pacientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top 5 Pacientes por Receita
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "receita")
                    return [`R$ ${value}`, "Receita Total"];
                  return [value, "Consultas"];
                }}
                labelFormatter={(label) => {
                  const patient = patientDistribution.find(
                    (p) => p.name === label
                  );
                  return patient?.fullName || label;
                }}
              />
              <Bar dataKey="receita" fill="#10B981" name="receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Receita Semanal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Receita Semanal (Últimas 6 semanas)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
              <Bar dataKey="receita" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consultas Diárias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Consultas Diárias (Últimos 14 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyConsultations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="consultas"
                stroke="#F59E0B"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
