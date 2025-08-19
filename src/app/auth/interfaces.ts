interface LoginPayload {
  username: string;
  password: string;
}
interface LoginResponse {
  access_token: string;
}
interface BaseRegisterPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
}
interface PatientRegisterPayload extends BaseRegisterPayload {
  dataNascimento: string;
}
interface PsychologistRegisterPayload extends BaseRegisterPayload {
  crp: string;
  endereco: string;
  numero: number;
}
interface RegisterResponse {
  id: string /* other fields... */;
}

export type {
  LoginPayload,
  LoginResponse,
  BaseRegisterPayload,
  PatientRegisterPayload,
  PsychologistRegisterPayload,
  RegisterResponse,
};
