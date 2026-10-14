export type ZazenSection = { id: 'posture' | 'breathing' | 'start'; heading: string; body: string };
export type ZazenSource = { publisher: string; title: string; checkedOn: string };
export type ZazenGuide = { revision: string; introduction: string; sections: readonly Readonly<ZazenSection>[]; sources: readonly Readonly<ZazenSource>[] };

const localGuide: ZazenGuide = {
  revision: '2026-10-14',
  introduction: 'Zazen é uma prática de meditação sentada da tradição zen. Esta introdução é opcional: não é tratamento médico ou psicológico e não substitui acompanhamento profissional.',
  sections: [
    { id: 'posture', heading: 'Postura', body: 'Escolha um assento estável. Uma cadeira, com os pés apoiados, é uma alternativa a sentar no chão. Busque uma posição ereta e confortável, com os ombros soltos e as mãos no colo. Não force as pernas em posição de lótus. Ajuste os apoios ou pare se estiver desconfortável.' },
    { id: 'breathing', heading: 'Respiração', body: 'Deixe a respiração seguir seu ritmo natural. Observe a entrada e a saída do ar, sem prender a respiração ou forçar sua profundidade. Quando perceber pensamentos ou distrações, volte sua atenção com gentileza, sem exigir um desempenho.' },
    { id: 'start', heading: 'Começar e encerrar', body: 'Se quiser experimentar, escolha um lugar com poucos estímulos e um momento em que possa parar livremente. Sente-se e observe por um tempo confortável para você, sem meta. Ao terminar, movimente-se devagar e retome suas atividades. Você também pode escolher não praticar.' },
  ],
  sources: [
    { publisher: 'Sotoshu', title: 'How to do Zazen', checkedOn: '2026-10-14' },
    { publisher: 'Zen Studies Society', title: 'How To Practice Zen', checkedOn: '2026-10-14' },
  ],
};
const sectionIds = ['posture', 'breathing', 'start'] as const;
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function section(value: unknown, expectedId: ZazenSection['id']): Readonly<ZazenSection> | null {
  if (!record(value)) return null;
  const { id, heading, body } = value;
  return id === expectedId && text(heading) && text(body) ? Object.freeze({ id: expectedId, heading, body }) : null;
}
function source(value: unknown): Readonly<ZazenSource> | null {
  if (!record(value)) return null;
  const { publisher, title, checkedOn } = value;
  return text(publisher) && text(title) && text(checkedOn) ? Object.freeze({ publisher, title, checkedOn }) : null;
}

// Validate the packaged content before presenting any partial instructions.
export function getZazenGuide(value: unknown = localGuide): Readonly<ZazenGuide> | null {
  try {
    if (!record(value)) return null;
    const { revision, introduction, sections: rawSections, sources: rawSources } = value;
    if (!text(revision) || !text(introduction) || !Array.isArray(rawSections) || !Array.isArray(rawSources)) return null;
    if (rawSections.length !== sectionIds.length || !rawSources.length) return null;
    const sections = Array.from(rawSections).map((value, index) => section(value, sectionIds[index]));
    const sources = Array.from(rawSources).map(source);
    if (sections.some(value => value === null) || sources.some(value => value === null)) return null;
    return Object.freeze({
      revision, introduction,
      sections: Object.freeze(sections.filter((value): value is Readonly<ZazenSection> => value !== null)),
      sources: Object.freeze(sources.filter((value): value is Readonly<ZazenSource> => value !== null)),
    });
  } catch { return null; }
}
