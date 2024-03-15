
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';



const apiheader = process.env.EXPO_PUBLIC_apiURI;


const EditProfileScreen = ({ navigation, route }) => {
  const [editedUserInfo, setEditedUserInfo] = useState({
    username: route.params.userInfo?.username || '',
    email: route.params.userInfo?.email || '',
  });

const handleSaveProfile = async () => {
    const credentials = {
      username: editedUserInfo.username,
      email: editedUserInfo.email,
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
      <Text>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={editedUserInfo.username}
        onChangeText={(text) => setEditedUserInfo({ ...editedUserInfo, username: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={editedUserInfo.email}
        onChangeText={(text) => setEditedUserInfo({ ...editedUserInfo, email: text })}
      />
      
      <Button title="Save Profile" onPress={handleSaveProfile} />
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
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default EditProfileScreen;
