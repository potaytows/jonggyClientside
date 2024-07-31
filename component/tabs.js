import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home';
import ProfileScreen from '../screens/profile';
import ReservationListScreen from '../screens/reservationList';
import HomeStack from './HomeStack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';




const Tab = createBottomTabNavigator()

const Tabs = () => {

  return (
      <Tab.Navigator>
          <Tab.Screen
        name={'home'}
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Home', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

<Tab.Screen
        name={'reservationList'}
        component={ReservationListScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'List', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name={'profile'}
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      
      </Tab.Navigator>

  )
}


export default Tabs