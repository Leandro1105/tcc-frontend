"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, User, TrendingUp, Clock, Search } from "lucide-react";
import { Patient } from "./interfaces";
import { moodOptions } from "./constants";
import { retrieveUserData } from "@/app/utils/retrieveUserData";
import { api } from "@/lib/api";

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} semana${
      Math.floor(diffInDays / 7) > 1 ? "s" : ""
    } atrás`;
  return `${Math.floor(diffInDays / 30)} mês${
    Math.floor(diffInDays / 30) > 1 ? "es" : ""
  } atrás`;
}

export default function PatientStatusPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      const profile = await retrieveUserData();
      const humor = (await api.get(
        `/humor/psicologo/${profile.id}`
      )) as Patient[];

      setPatients(humor);
    }
    fetchData();
  }, []);

  const getMoodData = (value: number) => {
    return moodOptions.find((mood) => mood.value === value);
  };

  // Filtrar pacientes baseado na busca
  const filteredPatients = patients.filter((patient) =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPatients = filteredPatients.length;
  const patientsWithMoodToday = filteredPatients.filter(
    (p) =>
      p.ultimoHumor &&
      p.ultimoHumor.length > 0 &&
      getTimeAgo(p.ultimoHumor[0].data) === "Hoje"
  ).length;
  const averageMood =
    filteredPatients.length > 0
      ? filteredPatients.reduce((sum, p) => sum + p.mediaHumor, 0) /
        filteredPatients.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Status dos Pacientes
          </h1>
          <p className="text-gray-600 mb-6">
            Acompanhe o humor e progresso dos seus pacientes
          </p>

          {/* Estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Pacientes</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {totalPatients}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registros Hoje</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {patientsWithMoodToday}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {averageMood.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campo de busca */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Grid de pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const latestMood =
              patient.ultimoHumor && patient.ultimoHumor.length > 0
                ? patient.ultimoHumor[0]
                : null;
            const moodData = latestMood ? getMoodData(latestMood.escala) : null;

            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow flex flex-col"
              >
                {/* Header do paciente */}
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {patient.nome}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {patient.email}
                    </p>
                  </div>
                </div>

                {/* Último humor */}
                <div className="mb-4">
                  {latestMood && moodData ? (
                    <div
                      className={`rounded-lg p-4 ${moodData.color} ${moodData.border} border`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Image
                          src={moodData.emoji}
                          alt={moodData.label}
                          width={32}
                          height={32}
                          draggable={false}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${moodData.textColor}`}>
                            {moodData.label}
                          </p>
                          <p className="text-xs text-gray-600">
                            {getTimeAgo(latestMood.data)}
                          </p>
                        </div>
                      </div>
                      {latestMood.observacoes && (
                        <p className="text-sm text-gray-700 italic line-clamp-2">
                          &quot;{latestMood.observacoes}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                      <p className="text-center text-gray-500 text-sm">
                        Nenhum humor registrado recentemente
                      </p>
                    </div>
                  )}
                </div>

                {/* Histórico de humores dos últimos 7 dias */}
                {patient.ultimoHumor && patient.ultimoHumor.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Últimos 7 dias
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {patient.ultimoHumor.slice(0, 7).map((mood, index) => {
                        const moodInfo = getMoodData(mood.escala);
                        return (
                          <div
                            key={mood.id}
                            className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center relative group"
                            title={`${moodInfo?.label} - ${getTimeAgo(
                              mood.data
                            )}`}
                          >
                            {moodInfo && (
                              <Image
                                src={moodInfo.emoji}
                                alt={moodInfo.label}
                                width={20}
                                height={20}
                                draggable={false}
                              />
                            )}
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Estatísticas do paciente */}
                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total de registros:
                    </span>
                    <span className="font-medium text-gray-900">
                      {patient.totalRegistros}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Média de humor:
                    </span>
                    <span className="font-medium text-gray-900">
                      {patient.mediaHumor.toFixed(1)}/5
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Últimos 7 dias:
                    </span>
                    <span className="font-medium text-gray-900">
                      {patient.ultimoHumor ? patient.ultimoHumor.length : 0}{" "}
                      registros
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Última consulta:
                    </span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(patient.ultimaConsulta)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Estado vazio */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patients.length === 0
                ? "Nenhum paciente encontrado"
                : "Nenhum resultado encontrado"}
            </h3>
            <p className="text-gray-600">
              {patients.length === 0
                ? "Você ainda não tem pacientes cadastrados"
                : "Tente ajustar o termo de busca"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
