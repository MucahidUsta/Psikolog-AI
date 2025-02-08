import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TextInput } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Provider as PaperProvider, Button, Card } from "react-native-paper";
import { generateResponse, uploadAudio, transcribeAudio } from "./src/services";

const App = () => {
  const [recording, setRecording] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        // Interruption mode'ları kaldırdık çünkü sorun yaratıyor
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setMessage("🎤 Seni dinliyorum...");
    } catch (err) {
      console.error("Kayıt başlatılamadı", err);
      setMessage("❌ Kayıt başlatılamadı, lütfen tekrar deneyin.");
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    setMessage("🤔 Ses analiz ediliyor...");
    
    try {
      const uri = recording.getURI();
      await recording.stopAndUnloadAsync();
      setRecording(null);
      
      // Ses dosyasını AssemblyAI'ye yükle
      const uploadUrl = await uploadAudio(uri);
      setMessage("🎯 Ses metne çevriliyor...");
      
      // Sesi metne çevir
      const transcribedText = await transcribeAudio(uploadUrl);
      setMessage("💭 Yanıt hazırlanıyor...");
      
      // Metni analiz et ve yanıt üret
      const response = generateResponse(transcribedText);
      
      setAiResponse(response);
      await speakText(response);
    } catch (error) {
      console.error("Hata:", error);
      setMessage("❌ Bir hata oluştu, lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  const handleTextSubmit = async () => {
    if (!userInput.trim()) {
      setMessage("ℹ️ Lütfen bir şeyler yazın");
      return;
    }
    
    setLoading(true);
    try {
      const response = generateResponse(userInput);
      setAiResponse(response);
      await speakText(response);
      setUserInput(""); // Input'u temizle
    } catch (error) {
      console.error("Hata:", error);
      setMessage("❌ Bir hata oluştu, lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const repeatSpeech = async () => {
    if (aiResponse) {
      await speakText(aiResponse);
    }
  };

  const speakText = async (text) => {
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: 'tr',
        rate: 0.8
      });
    } catch (error) {
      console.error("Ses çalma hatası:", error);
      setMessage("❌ Ses çalınamadı");
    }
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>🧠 Psikolog AI</Text>
        
        {message ? (
          <Text style={{ marginBottom: 10, color: 'gray' }}>{message}</Text>
        ) : null}
        
        <View style={{ width: '100%', marginBottom: 20 }}>
          <TextInput
            style={{
              width: '100%',
              padding: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              marginBottom: 10,
              minHeight: 80
            }}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Nasıl hissediyorsun?"
            multiline
          />
          
          <Button 
            mode="contained" 
            onPress={handleTextSubmit}
            style={{ marginBottom: 10 }}
          >
            💬 Metin Gönder
          </Button>
        </View>

        <View style={{ width: '100%', marginBottom: 20 }}>
          <Button 
            mode="contained"
            onPress={recording ? stopRecording : startRecording}
            style={{ 
              backgroundColor: recording ? '#ff4444' : '#2196F3',
              marginBottom: 10 
            }}
          >
            {recording ? "🔴 Kaydı Bitir" : "🎤 Sesli Anlat"}
          </Button>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />
        )}

        {aiResponse ? (
          <Card style={{ padding: 15, marginVertical: 10, width: '100%' }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>🤖 Psikolog AI:</Text>
            <Text style={{ lineHeight: 20 }}>{aiResponse}</Text>
          </Card>
        ) : null}

        {aiResponse ? (
          <Button 
            mode="outlined" 
            onPress={repeatSpeech}
            style={{ marginTop: 10 }}
            icon="volume-high"
          >
            🔊 Tekrar Dinle
          </Button>
        ) : null}
      </View>
    </PaperProvider>
  );
};

export default App;