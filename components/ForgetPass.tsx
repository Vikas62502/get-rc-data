import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import { client } from './client/axios'; // Axios instance
import Header from './Header';

const ForgetPass = ({ navigation }: any) => {
    const [identifier, setIdentifier] = useState(''); // Email or phone
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Reset Password
    const [loading, setLoading] = useState(false);

    // Handle OTP sending
    const handleSendOtp = async () => {
        if (!identifier) {
            Alert.alert('Error', 'Please provide your email or phone number.');
            return;
        }

        try {
            setLoading(true);
            const response = await client.post('/api/login/forgot-password', {
                emailOrPhone: identifier,
            });
            Alert.alert('Success', response?.data?.message || 'OTP sent successfully!');
            setStep(2); // Move to the reset password step
        } catch (error) {
            console.error('Send OTP Error:', error);
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle password reset
    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);
            const response = await client.post('/api/login/reset-password', {
                emailOrPhone: identifier,
                otp,
                newPassword,
            });
            Alert.alert('Success', response?.data?.message || 'Password reset successfully!');
            navigation.navigate('Login'); // Redirect to the login page
        } catch (error) {
            console.error('Reset Password Error:', error);
            Alert.alert('Error', 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
      <Header currentScreen={'Forgetpassword'} />

            <View style={styles.card}>
                <Text style={styles.title}>
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </Text>

                {step === 1 && (
                    <>
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

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSendOtp}
                            disabled={loading}>
                            <Text style={styles.buttonText}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 2 && (
                    <>
                        <View style={styles.inputContainer}>
                            <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP"
                                placeholderTextColor="#888"
                                keyboardType="number-pad"
                                value={otp}
                                onChangeText={setOtp}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Image source={require('../assets/padlock.png')} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { paddingRight: 40 }]}
                                placeholder="Enter New Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}>
                                <Image
                                    source={
                                        showPassword
                                            ? require('../assets/eye.png')
                                            : require('../assets/eye-off.png')
                                    }
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetPassword}
                            disabled={loading}>
                            <Text style={styles.buttonText}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <View></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#B2EBF2',
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
    eyeButton: {
        position: 'absolute',
        right: 20,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default ForgetPass;
