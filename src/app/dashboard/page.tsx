"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
  Activity,
  Target,
} from "lucide-react";
import { api } from "@/lib/api";
import { retrieveUserData, User } from "../utils/retrieveUserData";
import {
  DashboardPaciente,
  DashboardPsicologo,
  ConsultaPorMes,
  HumorDistribuicao,
  HumorTendencia,
  AtividadeImpacto,
  ProgressoSemanal,
  PacienteReceita,
  ConsultaPorDia,
  EvolucaoPaciente,
  PerformanceMensal,
} from "./interfaces";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);

  // Estados para dados do Paciente
  const [consultas, setConsultas] = useState<ConsultaPorMes[]>([]);
  const [humores, setHumores] = useState<HumorDistribuicao[]>([]);
  const [humorTendencia, setHumorTendencia] = useState<HumorTendencia[]>([]);
  const [atividades, setAtividades] = useState<AtividadeImpacto[]>([]);
  const [progressoSemanal, setProgressoSemanal] = useState<ProgressoSemanal[]>(
    []
  );

  // Estados para dados do psicólogo
  const [pacientesPorMes, setPacientesPorMes] = useState<PacienteReceita[]>([]);
  const [humoresPacientes, setHumoresPacientes] = useState<HumorDistribuicao[]>(
    []
  );
  const [consultasPorDia, setConsultasPorDia] = useState<ConsultaPorDia[]>([]);
  const [evolucaoPacientes, setEvolucaoPacientes] = useState<
    EvolucaoPaciente[]
  >([]);
  const [performanceMensal, setPerformanceMensal] = useState<
    PerformanceMensal[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const profile = await retrieveUserData();

      setUser(profile);

      if (profile.role === "Paciente") {
        const data = (await api.get(
          `/dashboard/paciente/${profile.id}`
        )) as DashboardPaciente;
        console.log("Dados do Paciente:", data);
        console.log("usuario:", profile);
        setConsultas(data.consultas);
        setHumores(data.humores);
        setHumorTendencia(data.humorTendencia);
        setAtividades(data.atividades);
        setProgressoSemanal(data.progressoSemanal);
      } else if (profile.role === "Psicologo") {
        const data = (await api.get(
          `/dashboard/psicologo/${profile.id}`
        )) as DashboardPsicologo;
        setPacientesPorMes(data.pacientesPorMes);
        setHumoresPacientes(data.humoresPacientes);
        setConsultasPorDia(data.consultasPorDiaSemana);
        setEvolucaoPacientes(data.evolucaoPacientes);
        setPerformanceMensal(data.performanceMensal);
      }
    }
    fetchData();
  }, []);

  if (!user) return <div className="p-4">Carregando...</div>;

  // Calcular estatísticas resumidas
  const estatisticas =
    user.role === "Paciente"
      ? {
          totalConsultas: consultas.reduce(
            (sum, item) => sum + item.consultas,
            0
          ),
          humorMedio:
            humorTendencia.length > 0
              ? Math.round(
                  humorTendencia.reduce((sum, item) => sum + item.humor, 0) /
                    humorTendencia.length
                )
              : 0,
          totalAtividades: atividades.reduce(
            (sum, item) => sum + item.quantidade,
            0
          ),
          impactoMedio:
            atividades.length > 0
              ? Math.round(
                  atividades.reduce((sum, item) => sum + item.impacto, 0) /
                    atividades.length
                )
              : 0,
        }
      : {
          totalPacientes:
            pacientesPorMes.length > 0
              ? pacientesPorMes[pacientesPorMes.length - 1].pacientes
              : 0,
          receitaMensal:
            pacientesPorMes.length > 0
              ? pacientesPorMes[pacientesPorMes.length - 1].receita
              : 0,
          consultasSemana: consultasPorDia.reduce(
            (sum, item) => sum + item.consultas,
            0
          ),
          crescimento:
            evolucaoPacientes.length > 0
              ? evolucaoPacientes[evolucaoPacientes.length - 1].novos
              : 0,
        };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50">
      <div className="flex-shrink-0 p-4 md:p-6 bg-white shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Bem-vindo ao dashboard, {user.nome}.{" "}
          {user.role === "Paciente"
            ? "Acompanhe seu progresso!"
            : "Gerencie sua prática!"}
        </p>
        {/* Indicador visual do tipo de usuário para debug */}
        <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
          Modo: {user.role === "Paciente" ? "Paciente" : "Psicólogo"}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="flex-shrink-0 p-4 md:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === "Paciente" ? (
            <>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Consultas</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.totalConsultas}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Humor Médio</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.humorMedio}/5
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Atividades</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.totalAtividades}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Target className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Impacto Médio</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.impactoMedio}/5
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Pacientes</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.totalPacientes}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Receita Mensal</p>
                  <p className="text-lg font-bold text-gray-800">
                    R$ {estatisticas.receitaMensal}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Consultas/Semana</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.consultasSemana}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Novos Pacientes</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estatisticas.crescimento}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6 overflow-auto">
        {user.role === "Paciente" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Consultas por Mês */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 col-span-1 lg:col-span-2 xl:col-span-1">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-700">
                Consultas por Mês
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={consultas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="consultas"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuição de Humores */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-purple-700">
                Distribuição de Humores
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={humores}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius="60%"
                    innerRadius="25%"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {humores.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tendência do Humor */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-green-700">
                Tendência do Humor
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={humorTendencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="humor"
                    stroke="#10B981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Atividades e Impacto */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 col-span-1 lg:col-span-2">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-orange-700">
                Atividades e Impacto
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={atividades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#F59E0B" name="Quantidade" />
                  <Bar dataKey="impacto" fill="#EF4444" name="Impacto" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progresso Semanal */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-indigo-700">
                Progresso Semanal
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={progressoSemanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="atividades"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                  />
                  <Area
                    type="monotone"
                    dataKey="humor"
                    stackId="2"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Pacientes e Receita */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 col-span-1 lg:col-span-2 xl:col-span-1">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-700">
                Pacientes e Receita
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pacientesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="pacientes"
                    fill="#3B82F6"
                    name="Pacientes"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="receita"
                    fill="#10B981"
                    name="Receita (R$)"
                  />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Humores dos Pacientes */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-purple-700">
                Humores dos Pacientes
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={humoresPacientes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius="60%"
                    innerRadius="25%"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {humoresPacientes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Consultas por Dia da Semana */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-green-700">
                Consultas por Dia
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={consultasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="consultas"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Evolução de Pacientes */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 col-span-1 lg:col-span-2">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-orange-700">
                Evolução de Pacientes
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolucaoPacientes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="novos"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Novos"
                  />
                  <Line
                    type="monotone"
                    dataKey="ativos"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Ativos"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Total"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Mensal */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-indigo-700">
                Performance Mensal
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={performanceMensal}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Performance"
                    dataKey="pontuacao"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
