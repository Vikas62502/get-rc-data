import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import { client } from './client/axios'; // Reuse axios client

const Signup = ({ onSwitch, navigation }: any) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name || !mobile || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // API Call
      const response = await client.post('/api/login/user-signup', {
        fullname: name,
        mobile,
        email,
        password,
        role: 'User',
      });
      Alert.alert('Success', 'Account created successfully. Please log in.');

      
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Error', 'Unable to sign up. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Image source={require('../assets/user.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Mobile Number Input */}
      <View style={styles.inputContainer}>
        <Image source={require('../assets/phone.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="+91 Enter Mobile Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Image source={require('../assets/email.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Email ID"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Signup Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {/* Toggle to Login */}
      <Text style={styles.toggleText}>
        Already a member?{' '}
        <Text style={styles.toggleLink} onPress={onSwitch}>
          Log In Now
        </Text>
      </Text>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    // backgroundColor: 'red',
    alignItems: 'center',
   height: '100%',
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
    marginRight: 10, // Space between icon and input field
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
});

export default Signup;