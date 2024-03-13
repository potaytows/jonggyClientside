import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image';
import _ from 'lodash';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReservationScreen = ({ navigation,route }) => {
    const [request, setRequest] = useState('');
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [selectedTables, setSelectedTables] = useState([]);

    const handleGetMenu = () => {
        navigation.navigate('menuTable',{
        restaurantId: route.params.restaurantId,
        selectedTables: selectedTables,
        
        });
    };

    const fetchRestaurantDetails = async () => {
        try {
            const response = await axios.get(apiheader + '/restaurants/' + route.params.restaurantId);
            const result = await response.data;
            setRestaurantDetails(result);
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        fetchRestaurantDetails();
        setSelectedTables(route.params.selectedTables || []);
    }, []);

    if (!restaurantDetails) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (    
                <View style={styles.container}>
                <ScrollView>
                    <View style={styles.restaurantContainer}>

                        <Image style={styles.logoRes} source={{ uri: apiheader + '/image/getRestaurantIcon/' + restaurantDetails._id }} />
                        <View style={styles.restaurantContainer2}>

                            <Text style={styles.restaurantName}>{restaurantDetails.restaurantName}</Text>

                            <Text style={styles.selectedTables}>โต๊ะที่เลือก:</Text>
                            <Text style={styles.selectedTables}>
                                {selectedTables.map((item, index) => (
                                    index == selectedTables.length - 1 ? (
                                        <Text key={index} >{item.tableName}</Text>
                                    ) : (<Text key={index} >{item.tableName}, </Text>)
                                ))}
                            </Text>

                        </View>
                        <TouchableOpacity style={styles.button}  onPress={handleGetMenu}>
                            <Text style={styles.buttonText}>สั่งอาหารล่วงหน้า</Text>
                        </TouchableOpacity>

                    </View>
                    <Text style={styles.rq}>ความต้องการเพิ่มเติม</Text>

            </ScrollView>
            <TouchableOpacity style={styles.buttonReserve}>
                            <Text style={styles.buttonText}>ยืนยันการจอง</Text>
                        </TouchableOpacity>
                </View>
          

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
        marginTop: 30,
    },
    restaurantContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        
    },
    restaurantContainer2: {
        width: '40%'
    },
    logoRes: {
        width: 80,
        height: 120,
        resizeMode: 'cover',
        borderRadius: 5,
        marginLeft: 10
    },
    restaurantName: {
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 10,
        fontWeight: 'bold',
       

    },
    selectedTables: {
        marginLeft: 20,
        marginTop: 5,
    },
    button: {
        backgroundColor: '#FF914D',
        width: '35%',
        padding: 10,
        borderRadius: 5,
        alignSelf:'flex-end',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight:'bold'
    },
    buttonReserve:{
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FF914D',
        padding: 10,
        borderRadius: 5,
        alignSelf:'center',
        width: '100%',
    },
    rq:{
        marginTop: 10,
        marginLeft:10
    }
});

export default ReservationScreen;
