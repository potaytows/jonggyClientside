import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const PasswordNewScreen = ({ route, navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    navigation.navigate('Login');
   
  };

  return (
    <View style={styles.container}>
      <Text>กรุณากรอกรหัสผ่านใหม่</Text>
      <TextInput
        placeholder="รหัสผ่านใหม่"
        placeholderTextColor="gray"
        style={styles.input}
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
        secureTextEntry
      />
      <TextInput
        placeholder="ยืนยันรหัสผ่าน"
        placeholderTextColor="gray"
        style={styles.input}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>ยืนยันการเปลี่ยนรหัสผ่าน</Text>
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
    width: '60%',
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

export default PasswordNewScreen;
