import React, { createContext, useContext, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';
import io from 'socket.io-client';
import { useNavigationState, useNavigation } from '@react-navigation/native';


const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const routeName = useNavigationState(state => state.routes[state.index]?.name);
 
  useEffect(() => {
    const handleNotification = (data) => {
      
      console.log('Notification received:', data);
      if (routeName !== 'Chat') {
        showMessage({
          message: data.sender,
          description: data.message,
          type: 'info',
          icon: 'info',
          duration: 5000,
        });
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [routeName]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
