
import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Text from '../component/Text';




const apiheader = process.env.EXPO_PUBLIC_apiURI;


const EditProfileScreen = ({ navigation, route }) => {
  const [editedUserInfo, setEditedUserInfo] = useState({
    username: route.params.userInfo?.username || '',
    email: route.params.userInfo?.email || '',
    phonenumber: route.params.userInfo?.phonenumber || '',
  });

  const handleSaveProfile = async () => {
    const credentials = {
      username: editedUserInfo.username,
      email: editedUserInfo.email,
      phonenumber: editedUserInfo.phonenumber,
    };


    Alert.alert(
      'Confirmation',
      'คุณต้องการเปลี่ยนแปลงข้อมูลใช้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: () => saveProfile(credentials) },
      ],
      { cancelable: false }
    );
  };

  const saveProfile = async (credentials) => {
    try {
      const response = await axios.put(apiheader + '/users/edit/' + route.params.userInfo?.username, credentials);
      if (response.data.status === 'edited') {
        const res = await response.data;
        console.log(res);
        await SecureStore.setItemAsync('userCredentials', JSON.stringify(res.obj));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.editContainer}>

        <Text>แก้ไขข้อมูลส่วนตัว</Text>
        <TextInput
          style={styles.input}
          placeholder="ชื่อผู้ใช้"
          value={editedUserInfo.username}
          onChangeText={(text) => setEditedUserInfo({ ...editedUserInfo, username: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          value={editedUserInfo.email}
          onChangeText={(text) => setEditedUserInfo({ ...editedUserInfo, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="เบอร์โทร"
          value={editedUserInfo.phonenumber}
          onChangeText={(text) => setEditedUserInfo({ ...editedUserInfo, phonenumber: text })}
        />
        <TouchableOpacity style={styles.btu} onPress={handleSaveProfile}>
          <Text style={styles.btutext}>ยันยันการแก้ไข</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',

  },
  editContainer: {

    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  btu: {
    backgroundColor: '#FF914D',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 10
  },
  btutext: {
    color: 'white',

  }
});

export default EditProfileScreen;
