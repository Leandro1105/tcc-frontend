import { Clock, Star, Edit3, Trash2 } from "lucide-react";

interface Atividade {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  impacto: number;
  pacienteId: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityCardProps {
  atividade: Atividade;
  onEdit?: (atividade: Atividade) => void;
  onDelete?: (atividadeId: string) => void;
  showFullDate?: boolean; // Nova prop para controlar se mostra data completa
}

export default function ActivityCard({
  atividade,
  onEdit,
  onDelete,
  showFullDate = false,
}: ActivityCardProps) {
  const getImpactoColor = (impacto: number) => {
    if (impacto <= 2) return "text-red-600 bg-red-50";
    if (impacto <= 3) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getImpactoText = (impacto: number) => {
    if (impacto <= 2) return "Negativo";
    if (impacto <= 3) return "Neutro";
    return "Positivo";
  };

  const formatDateTime = () => {
    const date = new Date(atividade.createdAt);

    if (showFullDate) {
      // Para atividades anteriores: mostrar data e hora
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Para atividades de hoje: mostrar apenas hora
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {atividade.tipo}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getImpactoColor(
                atividade.impacto
              )}`}
            >
              {getImpactoText(atividade.impacto)}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDateTime()}
            </span>
          </div>
          <p className="text-gray-900 font-medium mb-1">
            {atividade.descricao}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < atividade.impacto
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({atividade.impacto}/5)
            </span>
          </div>
        </div>

        {/* Botões de ação sempre visíveis */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(atividade)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium text-sm"
                title="Editar atividade"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(atividade.id)}
                className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium text-sm"
                title="Deletar atividade"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
