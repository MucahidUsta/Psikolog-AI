// import { pipeline } from '@huggingface/transformers';

// export const analyzeEmotion = async (text) => {
//   const emotionClassifier = await pipeline('sentiment-analysis');
//   const result = await emotionClassifier(text);
//   return result[0].label.toLowerCase(); // 'positive', 'negative', 'neutral' gibi sonuçlar döner
// };