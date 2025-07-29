// Interfaces específicas para dados do Dashboard

// Dados do Paciente
export interface ConsultaPorMes {
  name: string;
  consultas: number;
}

export interface HumorDistribuicao {
  name: string;
  value: number;
}

export interface HumorTendencia {
  data: string;
  humor: number;
}

export interface AtividadeImpacto {
  tipo: string;
  quantidade: number;
  impacto: number;
}

export interface ProgressoSemanal {
  semana: string;
  atividades: number;
  humor: number;
}

// Dados do Psicólogo
export interface PacienteReceita {
  name: string;
  pacientes: number;
  receita: number;
}

export interface ConsultaPorDia {
  dia: string;
  consultas: number;
}

export interface EvolucaoPaciente {
  mes: string;
  novos: number;
  ativos: number;
  total: number;
}

export interface PerformanceMensal {
  categoria: string;
  pontuacao: number;
}

// Interfaces principais para os dashboards
export interface DashboardPaciente {
  consultas: ConsultaPorMes[];
  humores: HumorDistribuicao[];
  humorTendencia: HumorTendencia[];
  atividades: AtividadeImpacto[];
  progressoSemanal: ProgressoSemanal[];
}

export interface DashboardPsicologo {
  pacientesPorMes: PacienteReceita[];
  humoresPacientes: HumorDistribuicao[];
  consultasPorDiaSemana: ConsultaPorDia[];
  evolucaoPacientes: EvolucaoPaciente[];
  performanceMensal: PerformanceMensal[];
}

// Estatísticas calculadas
export interface EstatisticasPaciente {
  totalConsultas: number;
  humorMedio: number;
  totalAtividades: number;
  impactoMedio: number;
}

export interface EstatisticasPsicologo {
  totalPacientes: number;
  receitaMensal: number;
  consultasSemana: number;
  crescimento: number;
}
