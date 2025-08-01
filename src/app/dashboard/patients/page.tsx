"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Clock, Activity, Search } from "lucide-react";
import { retrieveUserData } from "@/app/utils/retrieveUserData";
import { api } from "@/lib/api";
import { Patient } from "./interfaces";

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      const profile = await retrieveUserData();
      const activities = (await api.get(
        `/atividades/psicologo/${profile.id}`
      )) as Patient[];

      setPatients(activities);
    }
    fetchData();
  }, []);

  const allActivities = patients
    .flatMap((patient) =>
      patient.atividades.map((activity) => ({
        ...activity,
        pacienteNome: patient.nome,
      }))
    )
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // Filtrar atividades baseado apenas na busca
  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalActivities = allActivities.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Atividades dos Pacientes
          </h1>
          <p className="text-gray-600 mb-6">
            Acompanhe as atividades realizadas pelos seus pacientes
          </p>

          {/* Estatística geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Atividades</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {totalActivities}
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
                placeholder="Buscar atividade ou paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Tente ajustar o termo de busca"
                  : "Ainda não há atividades cadastradas"}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {activity.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          {activity.pacienteNome}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {activity.categoria}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{activity.descricao}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(new Date(activity.data))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(activity.data)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
