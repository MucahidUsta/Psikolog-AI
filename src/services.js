import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { ASSEMBLYAI_API_KEY, responses } from "./config";

// 📤 AssemblyAI'ye ses yükleme
export const uploadAudio = async (audioUri) => {
  try {
    console.log("Ses yükleme başlatılıyor, URI:", audioUri);

    // FileSystem.uploadAsync kullanarak dosyayı yükle
    const uploadResponse = await FileSystem.uploadAsync(
      "https://api.assemblyai.com/v2/upload",
      audioUri,
      {
        fieldName: 'audio',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
          'content-type': 'audio/m4a'
        }
      }
    );

    if (!uploadResponse.status === 200) {
      throw new Error(`Upload failed with status ${uploadResponse.status}`);
    }

    const uploadResult = JSON.parse(uploadResponse.body);
    console.log("Ses yükleme başarılı, URL:", uploadResult.upload_url);
    return uploadResult.upload_url;
    
  } catch (error) {
    console.error("Ses yükleme detaylı hata:", error);
    throw new Error("Ses dosyası yüklenirken bir hata oluştu: " + error.message);
  }
};

// 🎧 AssemblyAI ile sesi metne çevir
export const transcribeAudio = async (audioUrl) => {
  try {
    console.log("Transkripsiyon başlatılıyor, audio URL:", audioUrl);
    
    // Transkripsiyon isteği gönder
    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: "tr"
      })
    });

    const responseData = await response.json();
    console.log("Transkripsiyon isteği gönderildi, ID:", responseData.id);
    const transcriptId = responseData.id;
    let retryCount = 0;
    const maxRetries = 30;

    // Transkripsiyon tamamlanana kadar bekle
    while (retryCount < maxRetries) {
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 
          'authorization': ASSEMBLYAI_API_KEY
        }
      });

      const transcriptData = await pollResponse.json();
      console.log("Transkripsiyon durumu:", transcriptData.status);
      
      if (transcriptData.status === "completed") {
        console.log("Transkripsiyon sonucu:", transcriptData.text);
        return transcriptData.text || "Ses anlaşılamadı";
      }
      
      if (transcriptData.status === "error") {
        console.error("Transkripsiyon hata detayı:", transcriptData.error);
        throw new Error(`Transkripsiyon hatası: ${transcriptData.error}`);
      }

      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error("Transkripsiyon zaman aşımına uğradı");
    
  } catch (error) {
    console.error("Transkripsiyon detaylı hata:", error);
    throw new Error("Ses metne çevrilirken bir hata oluştu: " + error.message);
  }
};

// 🔍 Duygu Analizi
export const analyzeEmotion = (text) => {
  if (!text) return "neutral";
  
  const lowerText = text.toLowerCase();
  if (lowerText.includes("mutlu") || lowerText.includes("harika") || lowerText.includes("güzel")) return "happy";
  if (lowerText.includes("üzgün") || lowerText.includes("kötü") || lowerText.includes("mutsuz")) return "sad";
  if (lowerText.includes("kaygı") || lowerText.includes("endişe") || lowerText.includes("korku")) return "anxious";
  if (lowerText.includes("öfke") || lowerText.includes("sinir") || lowerText.includes("kızgın")) return "angry";
  return "neutral";
};

// 🧠 Yanıt Üretme
export const generateResponse = (text) => {
  try {
    const emotion = analyzeEmotion(text);
    return responses[emotion] || responses.neutral;
  } catch (error) {
    console.error("Yanıt üretme hatası:", error);
    return responses.neutral;
  }
};