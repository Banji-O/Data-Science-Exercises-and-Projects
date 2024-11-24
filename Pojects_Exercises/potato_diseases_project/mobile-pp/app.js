import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from '@react-native-image-picker/image-picker';
import axios from 'axios';

const App = () => {
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState(null);

  const handleImageSelection = async (method) => {
    setPredictionData(null);

    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    try {
      const result =
        method === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) {
        return; // User cancelled image selection
      }

      if (result.errorCode) {
        Alert.alert('Error', 'Failed to select an image');
        return;
      }

      const uri = result.assets[0]?.uri;
      setImageUri(uri);
      sendImageToServer(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while selecting an image.');
    }
  };

  const sendImageToServer = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        setPredictionData(response.data);
      } else {
        Alert.alert('Error', 'Failed to process the image.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while sending the image.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setImageUri(null);
    setPredictionData(null);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Potato Disease Classification</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Select or capture an image of a potato plant leaf</Text>
        )}
      </View>

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#be6a77" />
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      )}

      {predictionData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Label: {predictionData.class}</Text>
          <Text style={styles.resultText}>
            Confidence: {(parseFloat(predictionData.confidence) * 100).toFixed(2)}%
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleImageSelection('camera')}
        >
          <Text style={styles.buttonText}>Capture Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleImageSelection('library')}
        >
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <TouchableOpacity style={styles.clearButton} onPress={resetData}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#555',
  },
  loaderContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#be6a77',
    marginTop: 10,
  },
  resultContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#be6a77',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
