export interface Appointment {
  id: string;
  data: string;
  observacoes: string;
  pacienteId: string;
  psicologoId: string;
  psicologo: {
    id: string;
    nome: string;
    crp: string;
    email: string;
  };
  pagamentos: Payment[];
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  valor: number;
  data: string;
  dataVencimento: string;
  parcela: number;
  status: "Pendente" | "Pago";
  atendimentoId: string;
}
