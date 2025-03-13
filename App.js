import React, { useEffect, useState } from 'react';
import { SafeAreaView, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import FlashMessage from 'react-native-flash-message';

// Import Screens
import Tabs from './component/tabs';
import RegisterScreen from './screens/register';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import ProfileScreen from './screens/profile';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import ReservationScreen from './screens/reservation';
import EditProfileScreen from './screens/edit_profile';
import PasswordResetScreen from './screens/resetPassword';
import PasswordNewScreen from './screens/passwordnew';
import OTPVerificationScreen from './screens/verifyOTP';
import MenuTableScreen from './screens/menuTable';
import MenuListScreen from './screens/menuList';
import MenuChooseTableScreen from './screens/menuChooseTable';
import MenuAddonScreen from './screens/menuAddon';
import ReservationListScreen from './screens/reservationList';
import ReservationDetailScreen from './screens/reservationDetail';
import ChatScreen from './screens/chat';
import { NotificationProvider } from './screens/notification';
import SelectTimeScreen from './screens/selectTime';
import CouponScreen from './screens/coupon';
import HelpCenterScreen from './screens/helpCenter';
import SupportFormScreen from './screens/supportForm';
import ReserveTime from './screens/selectReserveTime';

const Stack = createStackNavigator();

LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [UserAuth, setUserAuth] = useState('');
  const [loaded, error] = useFonts({
    'Kanit-Regular': require('./assets/fonts/Kanit-Regular.ttf'),
    'Kanit-Bold': require('./assets/fonts/Kanit-Bold.ttf'),
  });

  const getLoginInformation = async () => {
    try {
      const user = await SecureStore.getItemAsync('userAuth');
      setUserAuth(user);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getLoginInformation();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Custom Gradient Header
  const CustomHeaderBackground = () => (
      <LinearGradient
        colors={['#FB992C', '#EC7A45']}
        start={{ x: 0.2, y: 0.8 }}
        style={{
          flex: 1,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <NavigationContainer>
        <NotificationProvider>
          <Stack.Navigator
            screenOptions={{
              headerBackground: () => <CustomHeaderBackground />,
              headerTintColor: 'white',
              headerTitleAlign: 'center',
              headerTitleStyle: { fontSize: 25, paddingTop: 12, fontFamily: 'Kanit-Regular' },
              headerBackImage: () => (
                <Ionicons
                  name="chevron-back"
                  size={40}
                  color="white"
                  style={{ paddingTop: 10 }}
                />
              ),
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen name="tab" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="reserve" component={ReservationScreen} options={{ title: 'รายการที่เลือก' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'แก้ไขข้อมูล' }} />
            <Stack.Screen name="forgotPassword" component={PasswordResetScreen} options={{ title: '' }} />
            <Stack.Screen name="editPassword" component={PasswordNewScreen} options={{ title: 'รหัสผ่านใหม่' }} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ title: 'OTP Verification' }} />
            <Stack.Screen name="menuTable" component={MenuTableScreen} options={{ title: 'เลือกการจัดเสริฟ' }} />
            <Stack.Screen name="menuList" component={MenuListScreen} options={{ title: 'เมนู' }} />
            <Stack.Screen name="chooseTable" component={MenuChooseTableScreen} options={{ title: 'เลือกโต๊ะ' }} />
            <Stack.Screen name="menuAddon" component={MenuAddonScreen} options={{ title: 'แอดออน' }} />
            <Stack.Screen name="reservationList" component={ReservationListScreen} options={{ title: 'รายการจอง' }} />
            <Stack.Screen name="reservationDetail" component={ReservationDetailScreen} options={{ title: 'รายการจองของคุณ' }} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={({ route }) => ({ title: route.params.restaurantName })}
            />
            <Stack.Screen name="selecttime" component={SelectTimeScreen} />
            <Stack.Screen name="coupon" component={CouponScreen} options={{ title: 'รายการจอง' }} />
            <Stack.Screen name="helpCenter" component={HelpCenterScreen} options={{ title: 'ศูนย์ช่วยเหลือ' }} />
            <Stack.Screen name="supportForm" component={SupportFormScreen} options={{ title: 'ศูนย์ช่วยเหลือ' }} />
            <Stack.Screen name="selectReserveTime" component={ReserveTime} options={{ title: 'เลือกเวลาจอง' }} />
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NotificationProvider>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;
