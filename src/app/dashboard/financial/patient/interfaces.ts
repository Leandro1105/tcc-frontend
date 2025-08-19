export interface Payment {
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
    psicologo: {
      nome: string;
    };
  };
}
