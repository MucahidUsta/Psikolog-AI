import { useState } from "react";
import { InferenceSession, Tensor } from "onnxruntime-react-native";

export const useModel = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runModel = async () => {
    setLoading(true);
    try {
      const session = await InferenceSession.create(
        require("./assets/model.onnx") // Model dosyasının yolu
      );
      const input = new Tensor(new Float32Array([1, 2, 3, 4]), [2, 2]);
      const feeds = { input_name: input };
      const results = await session.run(feeds);
      setResult(results);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, runModel };
};