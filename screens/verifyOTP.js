import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const OTPVerificationScreen = ({ route,navigation }) => {
  const [otp, setOTP] = useState('');

  const handleVerifyOTP = () => {
    navigation.navigate('editPassword');
    
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
