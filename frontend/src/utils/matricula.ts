/** Gera matrícula única a partir do timestamp: AAAA.MM.DD.HHmmss */
export function gerarMatricula(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ano = now.getFullYear();
  const mes = pad(now.getMonth() + 1);
  const dia = pad(now.getDate());
  const hora = pad(now.getHours());
  const min = pad(now.getMinutes());
  const seg = pad(now.getSeconds());
  return `${ano}.${mes}.${dia}.${hora}${min}${seg}`;
}

/** Normaliza o valor digitado no login (remove espaços). */
export function normalizarMatricula(valor: string): string {
  return valor.trim();
}
