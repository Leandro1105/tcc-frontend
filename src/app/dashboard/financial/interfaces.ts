interface Pagamento {
  id: string;
  valor: number;
  data: string;
  dataVencimento: string;
  parcela: number;
  status: "Pago";
  atendimentoId: string;
  atendimento: {
    id: string;
    data: string;
    paciente: {
      nome: string;
    };
  };
}

interface FinancialSummary {
  receitaTotal: number;
  receitaMensal: number;
  receitaSemanalMedia: number;
  totalConsultas: number;
  valorMedioConsulta: number;
  consultasMes: number;
}

export type { Pagamento, FinancialSummary };
