import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const DashboardCard = ({ vehicle, date, time, amount }: any) => {
  const borderColor = amount === '-00.00 Rs' ? '#FF0000' : '#A0A0A0';

  return (
    <View style={[styles.card, { borderColor }]}>
      <View style={styles.vehicleContainer}>
        <Image source={require('../assets/car.png')} style={styles.vehicleImage} />
        <Text style={styles.cardText}>{vehicle}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
      <Text style={styles.cardText}>{date}</Text>
      <Text style={styles.cardText}>{time}</Text>
      </View>
      <Text style={styles.cardText}>{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2, // Added border width
    elevation: 2,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 30, // Adjust the size of the image
    height: 30,
    marginRight: 15, // Space between image and text
  },
  cardText: {
    fontSize: 14,
    fontWeight:500,
    color: '#000',
  },
});

export default DashboardCard;
