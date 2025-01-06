// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

// const dummyUser = {
//   mobile: '9560611324',
//   password: 'mohit123',
// };

// const Login = ({ navigation, onSwitch }: any) => {
//   const [mobile, setMobile] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = () => {
//     if (mobile === dummyUser.mobile && password === dummyUser.password) {
//       navigation.navigate('Dashboard'); // Navigate to Dashboard screen
//     } else {
//       Alert.alert('Error', 'Invalid mobile number or password');
//     }
//   };

//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>Login</Text>

//       {/* Mobile Input */}
//       <View style={styles.inputContainer}>
//         <Image source={require('../assets/user.png')} style={styles.inputIcon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Mobile Number"
//           placeholderTextColor="#888"
//           keyboardType="phone-pad"
//           value={mobile}
//           onChangeText={setMobile}
//         />
//       </View>

//       {/* Password Input */}
//       <View style={styles.inputContainer}>
//         <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Password"
//           placeholderTextColor="#888"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//         />
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//       <Text style={styles.toggleText}>
//         Not a member?{' '}
//         <Text style={styles.toggleLink} onPress={onSwitch}>
//           Sign Up Now
//         </Text>
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: '90%',
//     padding: 20,
//     backgroundColor: '#FFF',
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 5,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   inputIcon: {
//     width: 30,
//     height: 30,
//     marginRight: 10, // Space between icon and input field
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 5,
//     fontSize: 14,
//   },
//   button: {
//     width: '100%',
//     padding: 10,
//     backgroundColor: '#00BCD4',
//     borderRadius: 5,
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: '#FFF',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   toggleText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   toggleLink: {
//     color: '#D32F2F',
//     fontWeight: 'bold',
//   },
// });

// export default Login;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import { client } from './client/axios';
import { getCache, setCache } from './client/storage';

const Login = ({ navigation, onSwitch }: any) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or mobile
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await client.post('/api/login/user-login', {
        emailOrPhone: identifier,
        password,
      });
      console.log(response.data, 'response');
      navigation.navigate('Dashboard', { token: response?.data?.token });
      await setCache('token', response?.data?.token);
      await setCache('userData', response?.data?.user);
      await setCache('refreshtoken', response?.data?.refreshToken);
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Image source={require('../assets/user.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Email or Mobile Number"
            placeholderTextColor="#888"
            keyboardType="default"
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputContainer}>
  <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
  <TextInput
    style={[styles.input, { paddingRight: 40 }]} // Extra padding to avoid overlap with eye icon
    placeholder="Enter Password"
    placeholderTextColor="#888"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
  />
  <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
    <Image
      source={
        showPassword
          ? require('../assets/eye.png') // Path to your "eye open" icon
          : require('../assets/eye-off.png') // Path to your "eye closed" icon
      }
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>


        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <Text style={styles.toggleText}>
          Not a member?{' '}
          <Text style={styles.toggleLink} onPress={onSwitch}>
            Sign Up Now
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    fontSize: 14,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    opacity: 0.6,
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#00BCD4',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleText: {
    fontSize: 14,
    color: '#555',
  },
  toggleLink: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  eyeButton: {
    position: 'absolute',
    right: 20, // Adjust as needed for spacing
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});

export default Login;
