import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../../components/AuthScreen'; // Adjust the path
import Dashboard from '../../components/Dashboard'; // Adjust the path
import Header from '@/components/Header'; // Adjust the path
import Login from '@/components/Login';

const Stack = createStackNavigator();

const Layout = () => {
  return (
    <View style={styles.container}>
      {/* Header will be visible on every screen */}
      {/* <Header /> */}
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Layout;
