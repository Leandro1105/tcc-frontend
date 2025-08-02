interface MoodEntry {
  id: string;
  data: string;
  escala: number;
  observacoes: string;
  pacienteId: string;
}

export interface Patient {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ultimoHumor: MoodEntry[];
  totalRegistros: number;
  mediaHumor: number;
  ultimaConsulta: string;
}
