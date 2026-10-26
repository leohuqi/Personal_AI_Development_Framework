/** Advisory terminology helpers. Never rewrite text or infer semantic equivalence/approval. */
export const DOMAINS = Object.freeze([
  'ProductAndRequirements', 'ProjectManagement', 'Architecture',
  'Engineering', 'AI', 'PADF_Governance',
]);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.every(nonempty);

export function validateGlossary(data) {
  const errors = [];
  if (!record(data)) return {valid: false, errors: ['Glossary must be an object']};
  if (data.schema_version !== 'padf.terminology/v1') errors.push('Unsupported schema_version');
  if (!strings(data.domains) || new Set(data.domains).size !== DOMAINS.length ||
      data.domains.length !== DOMAINS.length || DOMAINS.some(d => !data.domains.includes(d)))
    errors.push('domains must contain the six distinct supported domains');
  const ids = new Set();
  if (!Array.isArray(data.sources) || !data.sources.length) errors.push('sources must be nonempty');
  else for (const [i, source] of data.sources.entries()) {
    if (!record(source)) { errors.push(`source[${i}] must be an object`); continue; }
    for (const key of ['reference_id', 'title', 'url', 'source_class', 'verified_scope', 'observed_at', 'access_limitations'])
      if (!nonempty(source[key])) errors.push(`source[${i}].${key} is required`);
    if (ids.has(source.reference_id)) errors.push(`Duplicate source ${source.reference_id}`);
    ids.add(source.reference_id);
    try { if (!['https:', 'http:'].includes(new URL(source.url).protocol)) throw new Error(); }
    catch { errors.push(`source[${i}] requires an http(s) URL`); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.observed_at ?? '')) errors.push(`source[${i}] requires an observation date`);
  }
  const terms = new Set();
  if (!Array.isArray(data.terms) || !data.terms.length) errors.push('terms must be nonempty');
  else for (const [i, term] of data.terms.entries()) {
    if (!record(term)) { errors.push(`term[${i}] must be an object`); continue; }
    for (const key of ['term_id', 'english_term', 'preferred_zh', 'definition', 'domain', 'usage_example', 'verified_scope'])
      if (!nonempty(term[key])) errors.push(`term[${i}].${key} is required`);
    if (terms.has(term.term_id)) errors.push(`Duplicate term ${term.term_id}`);
    terms.add(term.term_id);
    if (!DOMAINS.includes(term.domain)) errors.push(`Unknown domain for ${term.term_id}`);
    for (const key of ['allowed_aliases', 'discouraged_terms'])
      if (!strings(term[key])) errors.push(`${term.term_id}.${key} must be a string array`);
    if (!strings(term.reference) || !term.reference.length || term.reference.some(id => !ids.has(id)))
      errors.push(`${term.term_id} has missing/unknown references`);
    if (!['PROPOSED', 'ACCEPTED', 'DEPRECATED'].includes(term.status)) errors.push(`Invalid status for ${term.term_id}`);
    if (!['general', 'padf_governance', 'project'].includes(term.term_kind)) errors.push(`Invalid term_kind for ${term.term_id}`);
    if (!['industry_usage', 'framework_definition', 'project_definition'].includes(term.definition_basis))
      errors.push(`Unverified definition basis for ${term.term_id}`);
    if (term.definition_basis === 'project_definition' && term.term_kind !== 'project')
      errors.push(`Project definition cannot be a generic term: ${term.term_id}`);
    if (term.zh_translation_status !== 'padf_recommended') errors.push(`Unsupported official-translation claim for ${term.term_id}`);
  }
  return {valid: !errors.length, errors};
}

export function selectTerms(data, domains) {
  const check = validateGlossary(data);
  if (!check.valid) throw new TypeError(check.errors.join('; '));
  if (!strings(domains) || !domains.length || domains.some(d => !DOMAINS.includes(d)))
    throw new TypeError('Select at least one supported domain');
  return data.terms.filter(term => domains.includes(term.domain)).map(term => structuredClone(term));
}

// Common Markdown code forms; deliberately conservative. This is not a Markdown parser.
const codePattern = /^(?: {0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?^(?: {0,3})\1[ \t]*$|(`+)([^`]*?)\2/gm;
const matches = (text, pattern) => [...text.matchAll(pattern)].map(m => m[0]);
function protectedParts(text, extra) {
  return {
    code: matches(text, codePattern),
    shas: matches(text, /\b[0-9a-f]{40}\b/gi),
    ids: matches(text, /\b(?:ADR-\d+|[A-Z][A-Z0-9]*-F\d+)\b/g),
    states: matches(text, /\b(?:PROPOSED|APPROVED|ACCEPTED|DEPRECATED|REJECTED|DESIGN_READY|BLOCKED|NOT_RUN|PENDING_OWNER_REVIEW)\b/g),
    apis: matches(text, /\b(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\/[A-Za-z0-9_./{}:?=&%-]+/g),
    extra: extra.map(token => [token, text.split(token).length - 1]),
  };
}

export function compareProtectedText(before, after, {extraProtected = [], historical = false} = {}) {
  if (typeof before !== 'string' || typeof after !== 'string' || !strings(extraProtected) || typeof historical !== 'boolean')
    throw new TypeError('Expected before/after text, a string token array and a historical boolean');
  const a = protectedParts(before, extraProtected), b = protectedParts(after, extraProtected);
  const changed = Object.keys(a).filter(key => JSON.stringify(a[key]) !== JSON.stringify(b[key]));
  if (historical && before !== after) changed.push('historical_record');
  return {
    protection_status: changed.length ? 'CHANGED' : 'NO_DETECTED_CHANGE', changed,
    semantic_status: 'NOT_VERIFIED', approval_status: 'NOT_VERIFIED',
    limitations: 'Only common code, API, ID, SHA, state and supplied token forms are checked. Responsibilities, authority, permissions, negation and recovery require contextual review.',
  };
}

export function terminologyHints(text, data, domains) {
  if (typeof text !== 'string') throw new TypeError('Expected text');
  const terms = selectTerms(data, domains);
  const prose = text.replace(codePattern, match => match.replace(/[^\n]/g, ' '));
  const hints = [];
  for (const term of terms) for (const entry of term.discouraged_terms) {
    const phrase = entry.split('（', 1)[0];
    // Do not flag generic short technical words such as 模型/闭包/Agent.
    if ([...phrase].length < 4 || !/[\u3400-\u9fff]/u.test(phrase)) continue;
    let start = 0, index;
    while ((index = prose.indexOf(phrase, start)) !== -1) {
      hints.push({term_id: term.term_id, line: prose.slice(0, index).split('\n').length,
        phrase, context_rule: entry, preferred_zh: term.preferred_zh, action: 'CONTEXT_REVIEW_REQUIRED'});
      start = index + phrase.length;
    }
  }
  return {hints, semantic_status: 'NOT_VERIFIED', action: 'ADVISORY_ONLY',
    limitations: 'Literal candidate matches only; no automatic replacement, exhaustive error detection or authorization.'};
}

export function renderGlossary(data) {
  const check = validateGlossary(data);
  if (!check.valid) throw new TypeError(check.errors.join('; '));
  const escape = text => text.replaceAll('|', '\\|').replaceAll('\n', ' ');
  const lines = ['# 通用术语阅读版', '', '由 `node scripts/build-glossary.mjs` 从 [GLOSSARY.yaml](GLOSSARY.yaml) 生成，请勿独立编辑。中文为 PADF 建议；词条状态不代表系统设计或操作获批。', ''];
  for (const domain of DOMAINS) {
    lines.push(`## ${domain}`, '', '| ID / 状态 | 中文 / English | 定义 | 来源 |', '| --- | --- | --- | --- |');
    for (const term of data.terms.filter(t => t.domain === domain)) {
      const refs = term.reference.map(id => {
        const source = data.sources.find(s => s.reference_id === id);
        return `[${id}](${source.url})`;
      }).join('、');
      lines.push(`| ${escape(term.term_id)} / ${term.status} | ${escape(term.preferred_zh)} / ${escape(term.english_term)} | ${escape(term.definition)} | ${refs} |`);
    }
    lines.push('');
  }
  lines.push('来源核验范围、别名、条件性用词提醒及例句见唯一数据源；[使用与保护规则](README.md)。', '');
  return lines.join('\n');
}
