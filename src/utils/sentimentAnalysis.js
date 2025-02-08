const positiveWords = ["mutlu", "harika", "iyi", "güzel", "başarılı", "seviyorum", "mükemmel", "pozitif", "umutlu"];
const negativeWords = ["kötü", "berbat", "mutsuz", "korkunç", "nefret", "olumsuz", "üzgün", "sinirli", "bıktım"];

export const analyzeSentiment = (text) => {
  let score = 0;
  const words = text.toLowerCase().split(" ");

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  if (score > 0) return { sentiment: "Pozitif 😊", score };
  if (score < 0) return { sentiment: "Negatif 😞", score };
  return { sentiment: "Nötr 😐", score };
};
