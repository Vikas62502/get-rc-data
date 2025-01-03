import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';

export const requestFileWritePermission = async () => {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    console.log(permissions.granted);
    if (!permissions.granted) {
        Alert.alert('Error', 'File Permissions Denied')
        return {
            access: false,
            directoryUri: null
        };
    }
    return {
        access: true,
        directoryUri: permissions.directoryUri
    };
}