import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { HeaderBackButton } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../component/Text';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ProfileScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userInfo });
  };
  const settime = () => {
    navigation.navigate('selecttime', { userInfo });
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
  const handleHelpCenter = () => {
    navigation.navigate('helpCenter');
};
  return (
    <View style={styles.container}>
      <LinearGradient style={styles.header}
        colors={['#FB992C', '#EC7A45']} start={{ x: 0.2, y: 0.8 }}>
        <View style={styles.flexheader}>
          <Text style={styles.home}>ฉัน</Text>
        </View>
      </LinearGradient>
      {isLoggedIn ? (
        <View>
          <View style={styles.Profilecontainer}>

            <View style={styles.flexpro_img}>
              <TouchableOpacity>
                <Image style={styles.profileImage} source={require('../assets/images/profileUser.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ChangeUser} onPress={handleEditProfile}>
                <Text style={styles.Name}>{userInfo?.username}</Text>
                <Text style={styles.Email}>{userInfo?.email}</Text>

              </TouchableOpacity>
            </View>
            <View style={styles.Other}>

              <Text style={styles.textTitle}>บัญชีของฉัน</Text>
              <TouchableOpacity style={styles.underline} onPress={settime} >
                <Text style={styles.textchick}>รายการโปรด</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.underline} >
                <Text style={styles.textchick}>วิธีการชำระเงิน</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.underline} >
                <Text style={styles.textchick}>สถานที่ที่ถูกบันทึกไว้</Text>
              </TouchableOpacity>

              <Text style={styles.textTitle}>ทั่วไป</Text>
              <TouchableOpacity style={styles.underline} onPress={handleHelpCenter}>
                <Text style={styles.textchick}>ศูนย์ช่วยเหลือ</Text>
              </TouchableOpacity>
              

            </View>
            <TouchableOpacity style={styles.underline} onPress={handleLogout}>
              <Text style={styles.textbutton}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (
        <View style={styles.loginScreen}>
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


  },
  Profilecontainer: {
    marginLeft: 20,
    marginRight: 20
  },
  header: {
    width: '100%',
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10

  },
  flexheader: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  home: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  ChangeUser: {
    marginLeft: 30
  },
  flexpro_img: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  Name: {
    fontSize: 25
  },
  Email: {
    fontSize: 18,
    color: 'gray'
  },

  underline: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray'
  },
  textchick: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 2

  },
  textTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
  
  },
  textbutton: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 2,
    color: 'red',

  },
  textbuttons: {
    backgroundColor: '#FF914D',
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
    borderRadius: 10
  },
  buttons: {
  },
  Logo: {
    width: 200,
    height: 200
  },
  loginScreen: {
    flex: 1,
    width: '50%',
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

export default ProfileScreen;
