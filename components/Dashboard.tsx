import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  BackHandler,
  RefreshControl,
  Linking,
} from 'react-native';
import DashboardCard from './DashboardCard';
import { client } from './client/axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Header from './Header';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [rcModalVisible, setRCModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await client.get('api/dashboard/get-user-dashboard-data');
      setUserData(response.data.userData);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate function for downloading Basic RC (PNG)
  const downloadBasicRC = async () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Error', 'Please enter a vehicle number.');
      return;
    }
    await handleDownloadRC('/api/dashboard/get-single-rc', 'png');
  };

  // Separate function for downloading Digital RC (PDF)
  const downloadDigitalRC = async () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Error', 'Please enter a vehicle number.');
      return;
    }
    await handleDownloadRC('/api/dashboard/get-digital-rc', 'pdf');
  };

  // Common download handler
  const handleDownloadRC = async (url: string, fileType: 'png' | 'pdf') => {
    setLoading(true);
    try {
      const response: any = await client.post(url, { rcId: vehicleNumber }, { responseType: 'arraybuffer' });

      if (response.status !== 200) {
        Alert.alert('Error', 'Failed to download RC.');
        return;
      }

      const fileExtension = fileType === 'png' ? 'png' : 'pdf';
      const fileName = `${vehicleNumber}_RC.${fileExtension}`;
      const fileData = Buffer.from(response.data, 'binary').toString('base64');

      if (Platform.OS === 'android') {
        let directoryUri = await AsyncStorage.getItem('download_directory_uri');

        // If no stored directory, request permission
        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            Alert.alert('Permission Denied', 'You need to grant access to a writable folder.');
            return;
          }

          directoryUri = permissions.directoryUri;
          await AsyncStorage.setItem('download_directory_uri', directoryUri);
        }

        try {
          // Try to create file in the selected folder
          const downloadUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri,
            fileName,
            fileType === 'png' ? 'image/png' : 'application/pdf'
          );

          await FileSystem.writeAsStringAsync(downloadUri, fileData, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Alert.alert('Success', `File saved in ${directoryUri}`);
        } catch (error) {
          console.error("Error writing to SAF folder, using fallback:", error);

          // Fallback to app cache directory
          const fallbackPath = `${FileSystem.cacheDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(fallbackPath, fileData, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert('Saved in Cache', 'Could not save to RC Folder. The file has been saved to app storage.');
        }
      } else {
        // iOS: Save to MediaLibrary
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      }

      setSuccessModalVisible(true);
      setRCModalVisible(false);
      setVehicleNumber('');
    } catch (error: any) {
      console.error('Error during file download:', error.message);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [successModalVisible]);

  useEffect(() => {
    fetchDashboardData();

    const backAction = () => {
      Alert.alert('Exit App', 'Do you want to exit the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const formatDate = (dateTimeString: any) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateTimeString: any) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString();
  };

  const renderTransaction = ({ item }: any) => (
    <DashboardCard
      vehicle={item.vehicleNumber}
      date={formatDate(item.createdAt)}
      time={formatTime(item.createdAt)}
      amount={item.amount}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {userData && (
          <View style={styles.header}>
            <Text style={styles.headerText}>Name: {userData.fullname}</Text>
            <Text style={styles.headerText}>Mobile No.: {userData.mobile}</Text>
            <Text style={styles.headerText}>Wallet: {userData.balance} Rs</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Vehicle Number"
            value={vehicleNumber}
            onChangeText={(text) => setVehicleNumber(text)}
          />
          <TouchableOpacity style={styles.button} onPress={() => setRCModalVisible(true)}>
            <Text style={styles.buttonText}>Get RC</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            key={transactions.length}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>
        {/* Redirect to whatsapp for top up with svg logo*/}
        <View style={{ position: 'absolute', right: 20, bottom: 20, zIndex: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "green",
              width: 60,  
              height: 60,
              borderRadius: 30, 
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() =>
              Linking.openURL(
                'https://api.whatsapp.com/send?phone=9057268352&text=Hello,%20Please%20add%20funds%20in%20my%20Wallet%20for%20RC'
              )
            }
          >
            <Fontisto name="whatsapp" size={30} color="white" />
          </TouchableOpacity>
        </View>

      </View>

      {/* RC Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rcModalVisible}
        onRequestClose={() => setRCModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setRCModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Download RC of : {vehicleNumber}</Text>
            <TouchableOpacity
              style={styles.rcButtonbasic}
              onPress={downloadBasicRC}
            >
              <Text style={styles.buttonText}>Download Basic RC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rcButtondigital}
              onPress={downloadDigitalRC}
            >
              <Text style={styles.buttonText}>Download Digital RC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentSuccess}>
            <Image
              source={require('../assets/success.png')}
              style={styles.successImage}
            />
            <Text style={styles.successText}>RC Downloaded Successfully!</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
    padding: 10,
  },
  header: {
    backgroundColor: '#D0EFFF',
    padding: 10,
    gap: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#A0D7FF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  closeButtonText: {
    fontSize: 35,
    color: '#000000',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  rcButtondigital: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  rcButtonbasic: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentSuccess: {
    width: '70%',
    height: '35%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successImage: { width: 100, height: 100, marginBottom: 16 },
  successText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  okButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: "10%",
  },
  okButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

});

export default Dashboard;
