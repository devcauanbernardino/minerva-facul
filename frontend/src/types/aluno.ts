import type { Curso } from "./curso";

export type Aluno = {
    id: number;
    matricula?: string;
    nome: string;
    email: string;
    curso: Curso;
    bolsa: boolean;
}