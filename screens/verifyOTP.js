import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Text from '../component/Text';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const OTPVerificationScreen = ({ route,navigation }) => {
    const { email } = route.params;
    const [otp, setOTP] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${apiheader}/users/verify-otp`, { email, otp });
      
      if (response.data.status === 'OTP verified') {
        Alert.alert('Success', 'OTP verified successfully');
        navigation.navigate('editPassword', { email });
      } else {
        Alert.alert('Error', 'Invalid OTP or OTP has expired');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Internal Server Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text>กรุณากรอก OTP ที่ส่งไปยังอีเมล </Text>
      <TextInput
        placeholder="OTP"
        placeholderTextColor="gray"
        style={styles.input}
        value={otp}
        onChangeText={(text) => setOTP(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        <Text style={styles.buttonText}>ยืนยัน OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    color: 'black',
    borderColor: 'gray',
    borderRadius: 5,
    width: '80%',
    padding: 10,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#FF914D',
    width: '40%',
    padding: 10,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
