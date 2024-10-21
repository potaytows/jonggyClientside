import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Text from '../component/Text';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPhoneNumberValid, setPhoneNumberValid] = useState(true);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    hideDatePicker();
    let dateTimeString =
      selectedDate.getDate() +
      '-' +
      (selectedDate.getMonth() + 1) +
      '-' +
      selectedDate.getFullYear()
    if (selectedDate) {
      setBirthday(dateTimeString);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePhoneNumber = (text) => {
    const isValid = /^\d{10}$/.test(text);
    setPhoneNumberValid(isValid);
  };


  const fetchaddUser = async () => {

    if (password !== confirmPassword) {
      Alert.alert('', 'รหัสผ่านไม่ตรงกัน', [{ text: 'OK', onPress: () => { } }]);
    } else {

      console.log('User registered successfully');
      console.log('Username: ', username);
      console.log('Email: ', email);
      console.log('Password: ', password);
      console.log('Birthday: ', birthday);
      console.log('Phonenumber: ', phonenumber);

    }
    try {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, email: email, password: password, birthday: birthday, phonenumber: phonenumber })
      };
      const response = await fetch(apiheader + '/users/addUser', fetchOptions);
      const result = await response.json();
      console.log(result);

      navigation.navigate('Login');
      Alert.alert('', 'สมัครเสร็จสิ้น', [{ text: 'OK', onPress: () => { } }]);

    } catch (error) {
      console.error(error);
    }

  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      <View style={styles.container2}>
        <Text style={styles.inputs} >ชื่อผู้ใช้</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={text => setUsername(text)}
        />
        <Text style={styles.inputs}>รหัสผ่าน</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.inputWithIcon}
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#FF914D"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputs}>ยืนยันรหัสผ่าน</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.inputWithIcon}
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.iconContainer}>
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#FF914D"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputs}>วัน/เดือน/ปี เกิด</Text>

        <Pressable onPress={showDatePicker}>
          <TextInput
            placeholderTextColor="gray"
            style={styles.input}
            value={birthday}
            onChangeText={text => setBirthday(text)}
            editable={false}
          />
        </Pressable>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          locale="th"
        />
        <Text style={styles.inputs}>อีเมล์</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <Text style={styles.inputs}>เบอร์โทรศัพท์</Text>
        <TextInput
          style={[styles.input, !isPhoneNumberValid && styles.invalidInput]}
          value={phonenumber}
          onChangeText={(text) => {
            setPhonenumber(text);
            validatePhoneNumber(text);
          }}
        />

        <TouchableOpacity
          style={[styles.button, !isPhoneNumberValid && styles.disabledButton]}
          onPress={fetchaddUser}
          disabled={!isPhoneNumberValid}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  inputs: {
    marginLeft: 45,
    color: '#FF914D',
    marginBottom: 5,


  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
    alignSelf: 'center',
  },
  inputWithIcon: {
    flex: 1,
    borderWidth: 1,
    color: 'white',
    borderColor: '#FF914D',
    borderRadius: 5,
    padding: 10,
  },
  iconContainer: {
    padding: 10,
    position: 'absolute',
    right: 0,
  },

  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container2: {
    width: '100%',

  },

  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#F66060'

  },
  input: {
    borderWidth: 1,
    color: 'white',
    borderColor: '#FF914D',
    borderRadius: 5,
    width: '80%',
    padding: 10,
    marginBottom: 10,
    alignSelf: 'center'


  },
  button: {
    backgroundColor: '#FF914D',
    width: '50%',
    padding: 10,
    marginTop: 20,
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  invalidInput: {
    borderColor: 'red',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },

});

export default RegisterScreen;