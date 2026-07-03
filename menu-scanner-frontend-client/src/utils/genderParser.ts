export const parseGender = (genderVal: string): string => {
  const clean = genderVal.trim().toLowerCase();
  const femaleSynonyms = ["female", "f", "girl", "woman", "ស្រី"];
  const maleSynonyms = ["male", "m", "boy", "man", "ប្រុស"];
  const otherSynonyms = ["other", "o"];
  if (femaleSynonyms.some(s => clean.includes(s))) return "FEMALE";
  if (maleSynonyms.some(s => clean.includes(s))) return "MALE";
  if (otherSynonyms.includes(clean)) return "OTHER";
  return "";
};
