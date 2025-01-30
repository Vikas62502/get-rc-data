// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

// const Header = () => {
//   const handleLogout = async () => {
//     try {
//       const response = await fetch('/api/login/user-logout', {
//         method: 'POST', // or 'GET' depending on your API
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         Alert.alert('Logout Successful', 'You have been logged out.');
//         // Additional actions like navigating to the login screen or clearing session data
//       } else {
//         const errorData = await response.json();
//         Alert.alert('Logout Failed', errorData.message || 'Something went wrong.');
//       }
//     } catch (error) {
//       Alert.alert('Logout Error', 'An error occurred while logging out.');
//     }
//   };

//   return (
//     <View style={styles.header}>
//       <Text style={styles.headerText}>GetRC</Text>
//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: '#006064',
//     width: '100%',
//     marginTop: 35,
//     paddingVertical: 20,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//   },
//   headerText: {
//     fontSize: 20,
//     width: '57%',
//     // backgroundColor: 'red',
//     textAlign: 'right',
//     fontWeight: 'bold',
//     color: '#FFF',
//   },
//   logoutButton: {
//     backgroundColor: 'white',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 5,
//   },
//   logoutButtonText: {
//     color: 'black',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default Header;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { client } from './client/axios';
import { useNavigation } from '@react-navigation/native';
import { clearAllCache, getCache } from './client/storage';


const Header = ({ currentScreen }: any) => {
  const navigation = useNavigation();
  const navigateToDashboard = async () => {
    const token = await getCache('token');
    if (token) {
      navigation.navigate('Dashboard');
    }
  }
  useEffect(() => {
    navigateToDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      // Show confirmation alert
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {

              try {
                await clearAllCache();

                const response = await client.post('api/login/user-logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                });
                Alert.alert('Logout Successful', 'You have been logged out.');
                console.log(response, 'response');

                // Navigate to the login screen
                navigation.navigate('Auth');
              } catch (error) {
                console.error('Logout Error:', JSON.stringify(error));
                Alert.alert('Logout Error', 'An error occurred while logging out.');
              }
            },
          },
        ],
        { cancelable: true } // Allow dismissing the alert by tapping outside
      );
    } catch (error) {
      console.error('Logout Error:', JSON.stringify(error));
      Alert.alert('Logout Error', 'An error occurred while preparing to log out.');
    }
  };


  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>GetRC</Text>
      {/* Conditionally render the logout button */}
      {currentScreen !== 'Login' && currentScreen !== 'Signup' && currentScreen!== 'Forgetpassword'&& (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#006064',
    width: '100%',
    top: 0,
    marginTop: 35,
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 20,
    width: '57%',
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
