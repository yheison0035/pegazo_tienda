export function formatText(text, type = "capitalize") {
  if (!text) return "";

  switch (type) {
    case "lower":
      return text.toLowerCase();

    case "upper":
      return text.toUpperCase();

    case "capitalize":
      // Unicode-aware: sube la primera letra de cada palabra respetando tildes/ñ
      // (el antiguo \b\w rompía "más" -> "MáS").
      return text
        .toLowerCase()
        .replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());

    case "sentence":
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    default:
      return text;
  }
}
