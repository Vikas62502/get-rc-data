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
import axios from 'axios';
import { client } from './client/axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Header from './Header';

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

  const handleDownloadRC = async () => {
    setLoading(true);
    try {
      const response = await client.post('api/dashboard/get-single-rc', { rcId: vehicleNumber }, { responseType: 'arraybuffer' });

      // Convert response data to Base64
      const base64Data = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;

      // Save file locally
      const fileUri = `${FileSystem.documentDirectory}${vehicleNumber}_RC.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });

      // Share or show file location
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `RC downloaded successfully! File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error downloading RC:', JSON.stringify(error));
      Alert.alert('Error', 'Failed to download RC. Please try again.');
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
          <TouchableOpacity style={styles.button} onPress={handleDownloadRC}>
            <Text style={styles.buttonText}>Get RC</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
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
    fontWeight: 600,
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
    backgroundColor: '#007BFF', // Blue background color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text color
    fontSize: 16,
    fontWeight: '600', // Semi-bold font weight
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
