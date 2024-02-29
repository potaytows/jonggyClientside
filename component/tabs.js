import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home';
import ProfileScreen from '../screens/profile';




const Tab = createBottomTabNavigator()

const Tabs = () => {

  return (
      <Tab.Navigator>
          <Tab.Screen name={'home'} component={HomeScreen} options={{headerShown:false}}/>
          <Tab.Screen name={'profile'} component={ProfileScreen} options={{headerShown:false}}/>
      </Tab.Navigator>

  )
}


export default Tabs