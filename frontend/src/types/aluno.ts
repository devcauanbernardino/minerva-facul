import type { Curso } from "./curso";

export type Aluno = {
    id: number;
    nome: string;
    email: string;
    curso: Curso;
    bolsa: boolean;
}