import { getZazenGuide } from '../../../src/features/meditation/zazen-guide';
const guide = getZazenGuide()!;
it('packages the reviewed introduction, three sections, revision and bibliographic credits locally', () => {
  expect(guide.revision).toBe('2026-10-14');
  expect(guide.sections.map(section => section.id)).toEqual(['posture', 'breathing', 'start']);
  expect(guide.sections.map(section => section.heading)).toEqual(['Postura', 'Respiração', 'Começar e encerrar']);
  expect(guide.introduction).toContain('não é tratamento médico ou psicológico');
  expect(guide.introduction).toContain('não substitui acompanhamento profissional');
  expect(guide.sources.map(source => source.publisher)).toEqual(['Sotoshu', 'Zen Studies Society']);
  expect(guide.sources.every(source => source.checkedOn === guide.revision)).toBe(true);
});
it('keeps the introduction voluntary without forced postures, breath retention or performance goals', () => {
  expect(guide.sections[0].body).toContain('Uma cadeira');
  expect(guide.sections[0].body).toContain('pare se estiver desconfortável');
  expect(guide.sections[1].body).toContain('sem prender a respiração');
  expect(guide.sections[2].body).toContain('sem meta');
  expect(guide.sections[2].body).toContain('escolher não praticar');
  expect(guide.sections.map(section => section.body).join(' ')).not.toMatch(/cura|trata ansiedade|reduz sintomas|garant|diagn[oó]stic|https?:\/\//i);
});
it.each([null, false, 0, {}, { ...guide, introduction: '' }, { ...guide, sections: [] }, { ...guide, sources: [] }])('rejects absent or incomplete local data %p without presenting partial instructions', value => {
  expect(getZazenGuide(value)).toBeNull();
});
it('rejects missing, reordered, duplicate, malformed and sparse sections or credits', () => {
  expect(getZazenGuide({ ...guide, sections: guide.sections.slice(1) })).toBeNull();
  expect(getZazenGuide({ ...guide, sections: [...guide.sections].reverse() })).toBeNull();
  expect(getZazenGuide({ ...guide, sections: [guide.sections[0], guide.sections[0], guide.sections[2]] })).toBeNull();
  expect(getZazenGuide({ ...guide, sections: [guide.sections[0], { ...guide.sections[1], body: {} }, guide.sections[2]] })).toBeNull();
  expect(getZazenGuide({ ...guide, sections: new Array(3) })).toBeNull();
  expect(getZazenGuide({ ...guide, sources: new Array(2) })).toBeNull();
  expect(getZazenGuide({ ...guide, sources: [{ ...guide.sources[0], checkedOn: '' }] })).toBeNull();
});
it('contains a throwing getter and reads each changing getter once before publishing validated snapshots', () => {
  expect(getZazenGuide({ get introduction(): never { throw new Error('Synthetic private content detail'); } })).toBeNull();
  const body = jest.fn().mockReturnValueOnce(guide.sections[0].body).mockReturnValue({});
  const current = getZazenGuide({ ...guide, sections: [{ ...guide.sections[0], get body() { return body(); } }, guide.sections[1], guide.sections[2]] });
  expect(body).toHaveBeenCalledTimes(1);
  expect(current?.sections[0].body).toBe(guide.sections[0].body);
});
it('returns deeply frozen independent snapshots without changing packaged content or caller data', () => {
  const input = JSON.parse(JSON.stringify(guide));
  const first = getZazenGuide(input)!; const second = getZazenGuide()!;
  input.sections[0].body = 'Synthetic changed draft';
  expect(first.sections[0].body).toBe(second.sections[0].body);
  expect(first).not.toBe(second);
  for (const value of [first, first.sections, first.sources, ...first.sections, ...first.sources]) expect(Object.isFrozen(value)).toBe(true);
});
