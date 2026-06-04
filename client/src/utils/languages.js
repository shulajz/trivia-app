export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'he', label: 'עברית (Hebrew)' },
];

export const DEFAULT_LANGUAGE = 'en';

export const getLanguageLabel = (code) =>
  LANGUAGES.find((lang) => lang.value === code)?.label || 'English';
