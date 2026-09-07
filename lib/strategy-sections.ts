// Os blocos fixos da estratégia — ver blueprint, módulo 7 "Estratégias".
// Reordenáveis e removíveis por cliente, mas o catálogo de tipos é fixo no MVP.

export const SECTION_DEFINITIONS: { type: string; title: string; placeholder: string }[] = [
  { type: "diagnostico", title: "Diagnóstico atual", placeholder: "Onde o cliente está hoje: contexto, histórico, principais problemas." },
  { type: "objetivos", title: "Objetivo principal e objetivos secundários", placeholder: "O que essa estratégia busca resolver, em ordem de prioridade." },
  { type: "metas", title: "Metas e indicadores de sucesso", placeholder: "Números que definem sucesso: CPL alvo, ROAS alvo, volume de leads..." },
  { type: "persona", title: "Persona ou público ideal", placeholder: "Quem é o cliente ideal: perfil, comportamento, contexto de compra." },
  { type: "dores_desejos", title: "Dores, desejos, objeções e estágio de consciência", placeholder: "O que trava a decisão e em que estágio a maior parte do público está." },
  { type: "oferta", title: "Oferta, promessa, diferenciais e provas", placeholder: "O que está sendo vendido, a promessa central, provas e diferenciais." },
  { type: "funil", title: "Funil e jornada de conversão", placeholder: "Etapas da jornada, do primeiro contato até a venda." },
  { type: "plataformas_orcamento", title: "Plataformas e distribuição de orçamento", placeholder: "Onde investir e como o orçamento se divide entre plataformas." },
  { type: "publicos", title: "Públicos de prospecção e remarketing", placeholder: "Segmentações e públicos usados em cada etapa." },
  { type: "linha_criativa", title: "Linha de criativos, hooks, copys e ângulos", placeholder: "Direção criativa: ganchos, ângulos de comunicação, formatos." },
  { type: "hipoteses", title: "Hipóteses de teste", placeholder: "O que ainda não se sabe e será testado." },
  { type: "plano_acao", title: "Plano de ação com responsáveis e prazos", placeholder: "Próximos passos concretos, quem faz e até quando." },
  { type: "aprendizados", title: "Aprendizados, decisões e próximos testes", placeholder: "O que os resultados até aqui ensinaram e o que vem a seguir." },
];

export function sectionTitle(type: string): string {
  return SECTION_DEFINITIONS.find((s) => s.type === type)?.title ?? type;
}
