interface ActivityEntry {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  categoria: string;
  pacienteId: string;
}

export interface Patient {
  id: string;
  nome: string;
  atividades: ActivityEntry[];
}
