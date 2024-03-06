import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image';
import _ from 'lodash';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReservationScreen = ({ route }) => {
    const [request, setRequest] = useState('');
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [selectedTables, setSelectedTables] = useState([]);

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
        <View>
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.restaurantContainer}>
                        <Image style={styles.logoRes} source={{ uri: apiheader + '/image/getRestaurantIcon/' + restaurantDetails._id }} />
                        <View>
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
                    </View>
                </View>

            </ScrollView>
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
        paddingBottom: 50
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
        marginLeft: 10
    },
    restaurantName: {
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 10,
        fontWeight: 'bold'

    },
    selectedTables: {
        marginLeft: 20,
        marginTop: 5,
    },
});

export default ReservationScreen;
