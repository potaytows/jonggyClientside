import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import Tabs from './component/tabs';
import RegisterScreen from './screens/register';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import ProfileScreen from './screens/profile';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen'; 
import * as SecureStore from 'expo-secure-store';

const Stack = createStackNavigator();



const App=()=> {
  const [UserAuth, setUserAuth] = useState((""));


  const getLoginInformation = async () => {
    

    try {

      user = await SecureStore.getItemAsync('userAuth');
      setUserAuth(user)

    } catch (e) {
      console.log(e)
    };
  };

  useEffect(() => {
    getLoginInformation();


  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerStyle: { backgroundColor: '#ff8a24' }, headerTintColor: 'white' ,headerTitleAlign: 'center'}}>
        <Stack.Screen name="tab" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name='profile' component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={({ route }) => ({ title: route.params.restaurantName})}/>
        
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}



export default App
