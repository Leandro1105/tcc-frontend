import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Payment {
  id: string;
  valor: number;
  data: string;
  dataVencimento: string;
  parcela: number;
  status: "Pago" | "Pendente";
  atendimentoId: string;
  createdAt: string;
  updatedAt: string;
  atendimento: {
    id: string;
    data: string;
    observacoes: string;
    pacienteId: string;
    psicologoId: string;
    createdAt: string;
    updatedAt: string;
    psicologo?: {
      nome: string;
    };
    paciente?: {
      nome: string;
      email: string;
    };
  };
}

interface PaymentCardProps {
  payment: Payment;
  userRole: "patient" | "psychologist";
  onConfirmPayment?: (paymentId: string) => void;
  isConfirming?: boolean;
}

export default function PaymentCard({
  payment,
  userRole,
  onConfirmPayment,
  isConfirming = false,
}: PaymentCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue =
    payment.status === "Pendente" &&
    new Date(payment.dataVencimento) < new Date();
  const isDueToday =
    payment.status === "Pendente" &&
    new Date(payment.dataVencimento).toDateString() ===
      new Date().toDateString();

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-l-4 p-4 hover:shadow-lg transition-shadow duration-200 ${
        payment.status === "Pago"
          ? "border-l-green-500"
          : isOverdue
          ? "border-l-red-500"
          : isDueToday
          ? "border-l-yellow-500"
          : "border-l-blue-500"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">
            {formatCurrency(payment.valor)}
          </h3>
          {payment.parcela && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Parcela {payment.parcela}
            </span>
          )}
        </div>
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            payment.status === "Pago"
              ? "bg-green-100 text-green-800"
              : isOverdue
              ? "bg-red-100 text-red-800"
              : isDueToday
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {payment.status === "Pago" ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          <span>
            {payment.status === "Pago"
              ? "Pago"
              : isOverdue
              ? "Vencido"
              : isDueToday
              ? "Vence hoje"
              : "Pendente"}
          </span>
        </div>
      </div>

      {/* Informações do atendimento */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Consulta: {formatDateTime(payment.atendimento.data)}</span>
        </div>

        {userRole === "patient" && payment.atendimento.psicologo && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Psicólogo:</span>{" "}
            {payment.atendimento.psicologo.nome}
          </div>
        )}

        {userRole === "psychologist" && payment.atendimento.paciente && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Paciente:</span>{" "}
            {payment.atendimento.paciente.nome}
          </div>
        )}

        {payment.atendimento.observacoes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Observações:</span>{" "}
            {payment.atendimento.observacoes}
          </div>
        )}
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Vencimento: {formatDate(payment.dataVencimento)}</span>
        </div>
        {payment.status === "Pago" && (
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Pago em: {formatDate(payment.data)}</span>
          </div>
        )}
      </div>

      {/* Avisos */}
      {isOverdue && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ Pagamento em atraso desde {formatDate(payment.dataVencimento)}
        </div>
      )}

      {isDueToday && payment.status === "Pendente" && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          ⏰ Pagamento vence hoje
        </div>
      )}

      {/* Botão de confirmar pagamento para psicólogos */}
      {userRole === "psychologist" &&
        payment.status === "Pendente" &&
        onConfirmPayment && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onConfirmPayment(payment.id)}
              disabled={isConfirming}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                isConfirming
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              }`}
            >
              {isConfirming ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                  <span>Confirmando...</span>
                </div>
              ) : (
                "✓ Confirmar Recebimento"
              )}
            </button>
          </div>
        )}
    </div>
  );
}
