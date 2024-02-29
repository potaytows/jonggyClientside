import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { HeaderBackButton } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ProfileScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const checkLoginStatus = async () => {
    try {
      const userCredentials = await SecureStore.getItemAsync('userCredentials');

      if (userCredentials) {
        setIsLoggedIn(true);
        // Decode user information (assuming it's stored as a JSON string)
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
          onPress={() => {}}
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
         <Text>ชื่อผู้ใช้: {userInfo?.username}</Text>
         <Text>อีเมล: {userInfo?.email}</Text>
         <Text>เบอร์โทรศัพท์: {userInfo?.phonenumber}</Text>
         <Button title="ออกจากระบบ" onPress={handleLogout} />
       </View>
      ) : (
       
        <Button title="เข้าสู่ระบบ" onPress={() => navigation.navigate('Login')} />

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
});

export default ProfileScreen;
