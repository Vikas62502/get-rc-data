import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Header from './Header'; // Import Header component

const AuthScreen = ({ navigation }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = async () => {
    try {
      await AsyncStorage.setItem('userToken', 'your-auth-token');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth token', error);
    }
  };

  if (loading) {
    // Show a loading spinner while checking authentication
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isAuthenticated) {
    // Render Dashboard if authenticated
    return (
      <View style={styles.container}>
        <Header currentScreen="Dashboard" />
        <Dashboard navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header currentScreen={isLogin ? 'Login' : 'Signup'} />
      {isLogin ? (
        <Login
          navigation={navigation}
          onSwitch={() => setIsLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Signup onSwitch={() => setIsLogin(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2EBF2',
    alignItems: 'center',
   
    justifyContent: 'flex-start',
  },
});

export default AuthScreen;
