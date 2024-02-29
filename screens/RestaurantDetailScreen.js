import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RestaurantDetailScreen = () => {
    const route = useRoute();
    const { restaurantId } = route.params;
    const [phonenumber, setPhonenumber] = useState('');

    const [restaurantDetails, setRestaurantDetails] = useState(null);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await axios.get(apiheader + '/restaurants/' + restaurantId);
                const result = await response.data;
                setRestaurantDetails(result);
            } catch (error) {
                console.error(error);
            }
        };

        fetchRestaurantDetails();
    }, [restaurantId]);

    if (!restaurantDetails) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.restaurantContainer}>
                <Image style={styles.logoRes} source={{ uri: apiheader + '/image/getRestaurantIcon/' + restaurantId }} />
                <Text style={styles.restaurantName}>{restaurantDetails.restaurantName}</Text>
                
            </View>
            <Text style={styles.help}>ความต้องการเพิ่มเติม</Text>
            <TextInput
                style={styles.input}
                value={phonenumber}
                onChangeText={text => setPhonenumber(text)}
            />
            <TouchableOpacity style={styles.reserveButton} >
                <Text style={styles.reserveButtonText}>ยืนยันการจอง</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 20,
      marginTop: 30,
      flexDirection: 'column', 
      alignItems: 'stretch', 
      position: 'relative',
    },
    restaurantContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    logoRes: {
      width: 80,
      height: 120,
      resizeMode: 'cover',
      borderRadius: 5,
    },
    restaurantName: {
      marginLeft: 10,
      marginTop: 5,
    },
    reserveButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#FF914D',
      padding: 10,
      borderRadius: 5,
      margin: 10,
    },
    reserveButtonText: {
      color: '#fff',
    },
    input: {
      marginTop: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      backgroundColor: '#fff',
      width: '70%',
    },
    help:{
        marginTop: 20
    }
  });
  


export default RestaurantDetailScreen;
