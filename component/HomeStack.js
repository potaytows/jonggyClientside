import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home';
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from '../screens/profile';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';


const Stack = createStackNavigator();


const HomeStack = () => {

    return (
        <Stack.Navigator
            screenOptions={{ headerStyle: { backgroundColor: '#ff8a24' }, headerTintColor: 'white' }}>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        </Stack.Navigator>

    )
}


export default HomeStack