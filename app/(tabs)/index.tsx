import React from 'react';
import { SafeAreaView } from 'react-native';
import AuthScreen from '../../components/AuthScreen'; // Adjust the path if needed
import Header from '@/components/Header';
import Layout from './_layout';

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <Header /> */}
      <Layout/>
    </SafeAreaView>
  );
};

export default HomeScreen;
