import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity,Image } from 'react-native';
import { HeaderBackButton } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ProfileScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userInfo });
  };


  const checkLoginStatus = async () => {
    try {
      const userCredentials = await SecureStore.getItemAsync('userCredentials');

      if (userCredentials) {
        setIsLoggedIn(true);
        const user = JSON.parse(userCredentials);
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => { }}
          disabled={true}
        />
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userCredentials');
      setIsLoggedIn(false);
      setUserInfo(null);
      navigation.navigate('Login');
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text>ชื่อผู้ใช้: {userInfo?.username}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.textbutton}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Image style={styles.Logo}
                source={require('../assets/images/Jonggylogo.png')}
            />
        <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.textbuttons}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '40%',
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 5
  },
  buttons: {
    width: '40%',
    backgroundColor:'#FF914D',
    padding:10,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 5
  },
  textbutton: {
    color: 'red',
    textAlign: 'center',
    textDecorationLine:'underline'
  },
  textbuttons: {
    color: 'white',
    textAlign: 'center',
  },
  Logo: {
    width: 200,
    height: 200
},
});

export default ProfileScreen;
