export interface Atendimento {
  id: string;
  data: string;
  observacoes: string;
  pacienteId: string;
  psicologoId: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  } | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface AtendimentoDisponivel {
  id: string;
  data: string;
  psicologoId: string;
  descricao: string;
  observacoes?: string;
  valor: number;
  createdAt: string;
  updatedAt: string;
  psicologo: {
    id: string;
    nome: string;
    email: string;
    crp: string;
    telefone: string;
    endereco: string;
    numero: number;
  };
}

export interface CreateAtendimentoDisponivel {
  data: string;
  descricao: string;
  observacoes?: string;
  valor: number;
  psicologoId: string;
}

export interface EditAtendimentoDisponivel {
  data?: string;
  descricao?: string;
  observacoes?: string;
  valor?: number;
}

export interface EditAtendimento {
  data?: string;
  observacoes?: string;
}
