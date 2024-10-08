import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

          <View style={styles.flexpro_img}>
            <TouchableOpacity>
              <View style={styles.profileImage}><Text></Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ChangeUser} onPress={handleEditProfile}>
              <Text style={styles.Name}>{userInfo?.username}</Text>
              <Text style={styles.Email}>{userInfo?.email}</Text>

            </TouchableOpacity>
          </View>
          <View style={styles.Other}>

            <Text style={styles.textTitle}>บัญชีของฉัน</Text>
            <TouchableOpacity style={styles.underline} >
              <Text style={styles.textchick}>รายการโปรด</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.underline} >
              <Text style={styles.textchick}>วิธีการชำระเงิน</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.underline} >
              <Text style={styles.textchick}>สถานที่ที่ถูกบันทึกไว้</Text>
            </TouchableOpacity>

            <Text style={styles.textTitle}>ทั่วไป</Text>
            <TouchableOpacity style={styles.underline} >
              <Text style={styles.textchick}>ศูนย์ช่วยเหลือ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.underline} >
              <Text style={styles.textchick}>การตั้งค่า</Text>
            </TouchableOpacity>

          </View>
          <TouchableOpacity style={styles.underline} onPress={handleLogout}>
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
    marginTop: 50,
    margin: 30,

  },
  ChangeUser: {
    marginLeft: 30
  },
  flexpro_img: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  Name: {
    fontSize: 25
  },
  Email: {
    fontSize: 18,
    color: 'gray'
  },

  underline:{
    borderBottomWidth:1,
    borderBottomColor:'gray'
  },
  textchick: {
    fontSize: 18,
    marginTop:15,
    marginBottom:2

  },
  textTitle:{
    fontSize: 18,
    fontWeight:'bold',
    marginTop:20
  },
  profileImage: {
    width: 75,
    height: 75,
    backgroundColor: 'gray',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'black'
  },
  textbutton: {
    fontSize: 18,
    marginTop:10,
    marginBottom:2,
    color: 'red',
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
