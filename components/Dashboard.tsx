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
  BackHandler
} from 'react-native';
import DashboardCard from './DashboardCard';
import { client } from './client/axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Header from './Header';
import { Buffer } from 'buffer';


type DashboardProps = {
  navigation: any;
};

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

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

  const handleDownloadRC = async (vehicleNumber: string) => {
    setLoading(true);
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'You need to enable permissions to save files.');
        return;
      }

      // Make the API request
      const response: any = await client.post(
        'api/dashboard/get-single-rc', // Replace with your API URL
        { rcId: vehicleNumber },
        { responseType: 'arraybuffer' } // Retrieve data as binary
      );

      if (response.status === 200) {
        const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

        const fileUri = `${FileSystem.documentDirectory}${vehicleNumber}_RC.png`;

        // Write the Base64 image to local filesystem
        await FileSystem.writeAsStringAsync(fileUri, base64Image.replace(/^data:image\/png;base64,/, ''), {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('RC Downloads', asset, false);

        Alert.alert('Success', 'Image saved to your device!');
      } else {
        Alert.alert('Error', 'Failed to download RC image.');
      }
    } catch (error) {
      console.error('Error downloading RC:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

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

    // Cleanup the event listener on component unmount
    return () => backHandler.remove();
  }, []);

  const formatDate = (dateTimeString: any) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString(); // e.g., "12/28/2024"
  };

  const formatTime = (dateTimeString: any) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString(); // e.g., "4:19:12 PM"
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
            onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
          />
          <TouchableOpacity style={styles.button} onPress={() => handleDownloadRC(vehicleNumber)}>
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
          />
        </View>
      </View>
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
});

export default Dashboard;
