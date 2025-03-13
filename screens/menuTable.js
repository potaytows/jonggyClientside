import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image';
import _ from 'lodash';
import Text from '../component/Text';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuTableScreen = ({route, navigation  }) => {
    const [selectedTables, setSelectedTables] = useState([]);


    const handleOrderTogether = () => {
        navigation.navigate('menuList', {
            restaurantId: route.params.restaurantId,
            restaurant: route.params.restaurant,
            selectedTables: selectedTables,
            navigationSource: 'OrderTogether',
            startTime:route.params.startTime,
            endTime:route.params.endTime
        });
      };
      const handleChooseTable = () => {
        navigation.navigate('chooseTable', {
            restaurantId: route.params.restaurantId,
            restaurant: route.params.restaurant,
            selectedTables: selectedTables,
            navigationSource: 'SingleTable',
            startTime:route.params.startTime,
            endTime:route.params.endTime
            

        });
      };

      useEffect(() => {
        setSelectedTables(route.params.selectedTables || []);
    }, []);
     
    

    return (
            <ScrollView style={styles.container}>
                <View style={styles.container}>
                    <View style={styles.restaurantContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleOrderTogether}>
                            <Text style={styles.buttonText}>สั่งอาหารรวมโต๊ะ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleChooseTable}>
                            <Text style={styles.buttonText}>สั่งอาหารแยกโต๊ะ</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'

    },
    restaurantContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,

    },
    button: {
        backgroundColor: '#FF914D',
        width: '40%',
        padding: 10,
        borderRadius: 5,
        marginTop: 15
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    
});

export default MenuTableScreen;
