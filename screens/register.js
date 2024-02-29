import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RegisterScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phonenumber, setPhonenumber] = useState('');

  
  const fetchaddUser = async ()=>{

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
        const fetchOptions={
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({username:username, email:email, password:password, birthday:birthday, phonenumber:phonenumber})
        };
        const response = await fetch(apiheader + '/users/addUser',fetchOptions);
        const result = await response.json();
        console.log(result);

        navigation.navigate('Login'); 
        Alert.alert('', 'สมัครเสร็จสิ้น', [{ text: 'OK', onPress: () => {} }]);

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
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />
        <Text style={styles.inputs}>ยืนยันรหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={text => setConfirmPassword(text)}
          secureTextEntry
        />
        <Text style={styles.inputs}>วัน/เดือน/ปี เกิด</Text>
        <TextInput
        placeholder='วว/ดด/ปป'
        placeholderTextColor="gray"
          style={styles.input}
          value={birthday}
          onChangeText={text => setBirthday(text)}
        />

        <Text style={styles.inputs}>อีเมล์</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <Text style={styles.inputs}>เบอร์โทรศัพท์</Text>
        <TextInput
        
          style={styles.input}
          value={phonenumber}
          onChangeText={text => setPhonenumber(text)}
        />

        <TouchableOpacity style={styles.button} onPress={fetchaddUser}>
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
    marginBottom: 5

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
    color:'#F66060'

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

});

export default RegisterScreen;