import AsyncStorage from '@react-native-async-storage/async-storage';

export const setCache = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error in saving data', error);
  }
};

export const getCache = async (key: string, defaultValue: any = null) => {
  try {
    const data = await AsyncStorage.getItem(key);

    if (data === null || data === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error in getting data', error);
    return defaultValue;
  }
};

export const clearAllCache =async () => {
  try {
     await AsyncStorage.clear()
   
  } catch (error) {
    console.error('Error in getting data', error);
  }
};