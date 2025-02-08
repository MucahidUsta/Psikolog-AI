import axios from "axios";
import { ASSEMBLYAI_API_KEY } from "./config";

export const uploadAudio = async (audioUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: audioUri,
    type: "audio/m4a",
    name: "audio.m4a",
  });

  try {
    const response = await axios.post("https://api.assemblyai.com/v2/upload", formData, {
      headers: { authorization: ASSEMBLYAI_API_KEY, "Content-Type": "multipart/form-data" },
    });

    return response.data.upload_url;
  } catch (error) {
    console.error("Ses yükleme hatası:", error);
    throw new Error("Ses dosyası yüklenirken bir hata oluştu.");
  }
};

export const transcribeAudio = async (audioUrl) => {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { authorization: ASSEMBLYAI_API_KEY } }
    );

    const transcriptId = response.data.id;
    let result;

    // Transkripsiyon tamamlanana kadar bekle
    while (true) {
      result = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      });

      if (result.data.status === "completed" || result.data.status === "error") {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 saniye bekle
    }

    if (result.data.status === "error") {
      throw new Error("Transkripsiyon başarısız oldu.");
    }

    if (!result.data.text) {
      throw new Error("Transkripsiyon başarısız oldu veya boş bir sonuç döndü.");
    }

    return result.data.text;
  } catch (error) {
    console.error("Ses metne çevirme hatası:", error);
    throw new Error("Ses metne çevrilirken bir hata oluştu.");
  }
};