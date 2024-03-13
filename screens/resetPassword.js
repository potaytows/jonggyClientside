import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const PasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailNotFound, setEmailNotFound] = useState(false);

  const handleSendOTP = async () => {
    try {
      const response = await axios.post(`${apiheader}/users/forgotPassword`, { email });
      
      if (response.data.status === 'success') {
        Alert.alert('Success', 'ส่ง OTP ไปยังเมล '+ email +' แล้ว');
        navigation.navigate('OTPVerification', { email });
      } else {
        setEmailNotFound(true);
      }
    } catch (error) {
      console.error(error);
      setEmailNotFound(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textTop}>กรุณากรอกที่อยู่อีเมลเพื่อรับ OTP</Text>
      <TextInput
        placeholder="ที่อยู่อีเมล"
        placeholderTextColor="gray"
        style={[styles.input, emailNotFound && styles.inputError]}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailNotFound(false); 
        }}
      />
      {emailNotFound && <Text style={styles.errorText}>ไม่พบอีเมลดังกล่าว</Text>}
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
    backgroundColor: '#2F2F2F',
  },
  textTop: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    color: 'white',
    borderColor: '#FF914D',
    borderRadius: 5,
    width: '80%',
    padding: 10,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
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
