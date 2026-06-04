const stripCodeFences = (content) => {
  let text = content.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }
  return text.trim();
};

const extractJsonSlice = (text) => {
  const objectStart = text.indexOf('{');
  const arrayStart = text.indexOf('[');

  if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
    const objectEnd = text.lastIndexOf('}');
    if (objectEnd > objectStart) {
      return text.slice(objectStart, objectEnd + 1);
    }
  }

  if (arrayStart !== -1) {
    const arrayEnd = text.lastIndexOf(']');
    if (arrayEnd > arrayStart) {
      return text.slice(arrayStart, arrayEnd + 1);
    }
  }

  throw new Error('No JSON found in response');
};

const repairJson = (jsonText) =>
  jsonText
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    .replace(/([{,]\s*)([a-zA-Z_]+)(\s*:)/g, '$1"$2"$3');

export const parseQuestionsJson = (content) => {
  const cleaned = stripCodeFences(content);
  const slice = extractJsonSlice(cleaned);

  let parsed;
  try {
    parsed = JSON.parse(slice);
  } catch {
    parsed = JSON.parse(repairJson(slice));
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions;
  }

  throw new Error('Response JSON must be an array or { "questions": [...] }');
};
