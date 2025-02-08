import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import RNFS from 'react-native-fs';

const runModel = async () => {
  await tf.ready();

  // Model dosyasını yerel cihazdan yükle
  const modelPath = `${RNFS.DocumentDirectoryPath}/model.json`;
  const model = await tf.loadLayersModel(`file://${modelPath}`);

  // Giriş tensörünü oluştur
  const input = tf.tensor2d([1, 2, 3, 4], [2, 2]);

  // Modeli çalıştır
  const result = model.predict(input);
  result.print();
};