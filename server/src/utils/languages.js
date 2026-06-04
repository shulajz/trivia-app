export const SUPPORTED_LANGUAGES = ['en', 'he'];

export const normalizeLanguage = (language) => {
  const code = language?.trim().toLowerCase();
  if (code === 'he' || code === 'hebrew' || code === 'עברית') return 'he';
  return 'en';
};
