"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PsychologistAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  }) => void;
  appointment?: {
    id: string;
    data: string;
    observacoes: string;
    valor: number;
    descricao: string;
  } | null;
  mode: "create" | "edit-available" | "edit-scheduled";
}

export default function PsychologistAppointmentModal({
  open,
  onClose,
  onSubmit,
  appointment,
  mode,
}: PsychologistAppointmentModalProps) {
  const [formData, setFormData] = useState({
    data: "",
    observacoes: "",
    valor: "",
    descricao: "",
  });

  useEffect(() => {
    if (appointment && mode !== "create") {
      setFormData({
        data: appointment.data,
        observacoes: appointment.observacoes,
        valor: appointment.valor?.toString() || "",
        descricao: appointment.descricao,
      });
    } else {
      setFormData({
        data: "",
        observacoes: "",
        valor: "",
        descricao: "",
      });
    }
  }, [appointment, open, mode]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      data: formData.data,
      observacoes: formData.observacoes,
      valor: Number(formData.valor),
      descricao: formData.descricao,
    });
    setFormData({
      data: "",
      observacoes: "",
      valor: "",
      descricao: "",
    });
    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Novo Horário Disponível";
      case "edit-available":
        return "Editar Horário Disponível";
      case "edit-scheduled":
        return "Editar Atendimento Agendado";
      default:
        return "Atendimento";
    }
  };

  const showValueField = mode === "create" || mode === "edit-available";
  const showDescriptionField = mode === "create" || mode === "edit-available";
  const isScheduledEdit = mode === "edit-scheduled";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {getTitle()}
        </h2>

        {isScheduledEdit && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Atenção:</strong> Este é um atendimento já agendado com
              paciente. Você pode alterar apenas a data/hora e observações.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`grid grid-cols-1 ${
              showValueField ? "md:grid-cols-2" : ""
            } gap-4`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Data e hora *
              </label>
              <input
                type="datetime-local"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>
            {showValueField && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
            )}
          </div>

          {showDescriptionField && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Ex: Primeira consulta - Avaliação inicial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder={
                isScheduledEdit
                  ? "Observações sobre o atendimento agendado"
                  : "Observações adicionais sobre o horário disponível"
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {mode === "create" ? "Criar Horário" : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
