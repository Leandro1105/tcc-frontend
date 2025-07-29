"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, Check, Edit3, Trash2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { moodOptions } from "./constants";
import { formatDate, formatShortDate } from "./helpers";
import { MoodEntry } from "./interfaces";
import { retrieveUserData, User } from "@/app/utils/retrieveUserData";

export default function MoodPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Verificar se já existe humor cadastrado hoje
  const todayMood = moodEntries.find(
    (entry) => new Date(entry.data).toISOString().split("T")[0] === todayString
  );

  useEffect(() => {
    async function fetchData() {
      const profile = await retrieveUserData();
      setUser(profile);
      const moods = (await api.get(
        `/humor/paciente/${profile.id}`
      )) as MoodEntry[];

      setMoodEntries(moods);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const hasTodayMood = moodEntries.some(
      (entry) =>
        new Date(entry.data).toISOString().split("T")[0] === todayString
    );

    if (hasTodayMood && !editingEntry) {
      setShowForm(false);
    } else if (!hasTodayMood && !editingEntry) {
      setShowForm(true);
    }
  }, [moodEntries, editingEntry, todayString]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEntry) {
      // Editar entrada existente
      const updatedEntry = {
        ...editingEntry,
        escala: selectedMood!,
        observacoes,
      };

      await api.patch(`/humor/${editingEntry.id}`, updatedEntry);

      setMoodEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id ? updatedEntry : entry
        )
      );
      setEditingEntry(null);
    } else {
      // Criar nova entrada
      const newEntry: MoodEntry = {
        data: today.toISOString(),
        escala: selectedMood!,
        observacoes,
        pacienteId: user?.id,
      };
      const createdEntry = (await api.post("/humor", newEntry)) as MoodEntry;

      setMoodEntries((prev) => [createdEntry, ...prev]);
    }

    setSelectedMood(null);
    setObservacoes("");
    setShowForm(false);
  };

  const handleEdit = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setSelectedMood(entry.escala);
    setObservacoes(entry.observacoes);
    setShowForm(true);
  };

  const handleDelete = async (entryId: string) => {
    await api.delete(`/humor/${entryId}`);

    setMoodEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    if (entryId === todayMood?.id) {
      setShowForm(true);
    }
  };

  const getMoodData = (value: number) => {
    return moodOptions.find((mood) => mood.value === value);
  };

  const getWeekAverage = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = moodEntries.filter(
      (entry) => new Date(entry.data) >= weekAgo
    );
    if (weekEntries.length === 0) return 0;
    return (
      weekEntries.reduce((sum, entry) => sum + entry.escala, 0) /
      weekEntries.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com estatísticas */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registro de Humor
          </h1>
          <p className="text-gray-600 mb-6">{formatDate(today)}</p>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média da Semana</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {getWeekAverage().toFixed(1)}/5
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
                  <p className="text-sm text-gray-600">Dias Registrados</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {moodEntries.length}
                  </p>
                </div>
              </div>
            </div>

            {todayMood && (
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Check className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Humor de Hoje</p>
                    <p className="text-xl text-black font-semibold">
                      {getMoodData(todayMood.escala)?.label}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário ou Estado Atual */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {editingEntry ? "Editar Humor" : "Como você está hoje?"}
                  </h2>

                  {/* Emojis */}
                  <div className="grid grid-cols-5 gap-3 mb-6 w-full">
                    {moodOptions.map((mood) => (
                      <motion.button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 shadow-sm transition-all duration-200
                          ${mood.color} ${mood.border}
                          ${
                            selectedMood === mood.value
                              ? "scale-110 ring-4 ring-blue-200 border-blue-400"
                              : "hover:scale-105"
                          }
                        `}
                        animate={{
                          scale: selectedMood === mood.value ? 1.1 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        type="button"
                      >
                        <Image
                          src={mood.emoji}
                          alt={mood.label}
                          width={50}
                          height={50}
                          draggable={false}
                          priority
                        />
                        <span
                          className={`text-xs font-medium text-center mt-1 ${
                            selectedMood === mood.value
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {mood.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Observações"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                    />

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!selectedMood}
                        className={`flex-1 py-3 px-6 text-white rounded-lg font-semibold transition-colors shadow-lg
                          ${
                            selectedMood
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-400 cursor-not-allowed"
                          }`}
                      >
                        {editingEntry ? "Salvar Alterações" : "Salvar Humor"}
                      </button>

                      {editingEntry && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(null);
                            setSelectedMood(null);
                            setObservacoes("");
                            setShowForm(!todayMood);
                          }}
                          className="px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              ) : todayMood ? (
                <motion.div
                  key="today-mood"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Humor de Hoje
                  </h2>

                  <div className="mb-6">
                    <Image
                      src={getMoodData(todayMood.escala)?.emoji || ""}
                      alt={getMoodData(todayMood.escala)?.label || ""}
                      width={120}
                      height={120}
                      draggable={false}
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {getMoodData(todayMood.escala)?.label}
                    </h3>
                    {todayMood.observacoes && (
                      <p className="text-gray-600 italic">
                        &quot;{todayMood.observacoes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => handleEdit(todayMood)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 size={18} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(todayMood.id!)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Histórico */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Histórico Recente
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {moodEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum registro encontrado
                </p>
              ) : (
                moodEntries.map((entry) => {
                  const moodData = getMoodData(entry.escala);
                  const entryDate = new Date(entry.data);
                  const isToday = entry.id === todayMood?.id;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        isToday
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Image
                        src={moodData?.emoji || ""}
                        alt={moodData?.label || ""}
                        width={40}
                        height={40}
                        draggable={false}
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {moodData?.label}
                          </span>
                          {isToday && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Hoje
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatShortDate(entryDate)} •{" "}
                          {entryDate.toLocaleDateString("pt-BR", {
                            weekday: "short",
                          })}
                        </p>
                        {entry.observacoes && (
                          <p className="text-sm text-gray-700 mt-1 italic">
                            &quot;{entry.observacoes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id!)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
