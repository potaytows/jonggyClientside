import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const PasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendOTP = async () => {
    navigation.navigate('otp');
  };

  return (
    <View style={styles.container}>
      <Text>กรุณากรอกที่อยู่อีเมลเพื่อรับ OTP</Text>
      <TextInput
        placeholder="ที่อยู่อีเมล"
        placeholderTextColor="gray"
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>ส่ง OTP</Text>
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

export default PasswordResetScreen;
