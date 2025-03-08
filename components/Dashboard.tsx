import React, { useState, useEffect } from 'react';
import {
  Alert,
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
import Fontisto from '@expo/vector-icons/Fontisto';
import { styles } from './Styles/dashboardStyle';

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

  const handleDownloadRC = async (vehicleNumber: string, rcType: string) => {
    setLoading(true);
    try {
      // Request Media Library Permissions
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission denied', 'You need to enable permissions to save files.');
        return;
      }

      // API Endpoint
      const baseUrl = rcType === 'basic' ? 'api/dashboard/get-single-rc' : 'api/dashboard/get-digital-rc';
      const response: any = await client.post(
        baseUrl,
        { rcId: vehicleNumber },
        { responseType: 'arraybuffer' }
      );

      if (response.status === 200) {
        const base64Data = Buffer.from(response.data, 'binary').toString('base64');
        const fileUri = `${FileSystem.cacheDirectory}RC_${Date.now()}.png`;

        // Check if file exists, if not, create an empty file
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          console.log("File does not exist, creating a new one...");
          await FileSystem.writeAsStringAsync(fileUri, '', {
            encoding: FileSystem.EncodingType.UTF8,
          });
        }

        // Write Base64 Image Data
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Verify that the file now exists before proceeding
        const newFileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!newFileInfo.exists) {
          throw new Error("File creation failed! Something went wrong while writing the image.");
        }

        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(fileUri);

        setVehicleNumber('');
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to download RC image.');
      }
      setRCModalVisible(false);
    } catch (error: any) {
      console.log('Full Error Object:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.log('Error Response:', JSON.stringify(error.response, null, 2));

        if (error.response.data instanceof ArrayBuffer) {
          const decodedData = new TextDecoder().decode(error.response.data);
          const parsedData = JSON.parse(decodedData);
          Alert.alert('Error', parsedData.message || 'Unknown error occurred.');
        } else {
          Alert.alert(
            'Server Error',
            `Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`
          );
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
      setRCModalVisible(false);
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
              <Text style={styles.closeButtonText}>{'X'}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Download RC of : {vehicleNumber?.toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.rcButtonbasic}
              onPress={() => handleDownloadRC(vehicleNumber, 'basic')}
            >
              <Text style={styles.buttonText}>Download Basic RC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rcButtondigital}
              onPress={() => handleDownloadRC(vehicleNumber, 'digital')}
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

export default Dashboard;
