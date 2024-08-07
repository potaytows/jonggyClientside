import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';



const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReservationListScreen = ({ route, navigation }) => {
    const [reservationList, setReservationList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReservations = async () => {
        setLoading(true);

        try {
            const userCredentials = await SecureStore.getItemAsync('userCredentials');
            const { username } = JSON.parse(userCredentials);

            const response = await axios.get(apiheader + '/reservation/getReservationsByUsername/' + username);
            const result = await response.data;
            setReservationList(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    

    useFocusEffect(
        React.useCallback(() => {
            loadReservations();
        }, [])
    );

    useEffect(() => {
        loadReservations();
    }, []);

    const handleButtonPress = (reservation) => {
        navigation.navigate('reservationDetail', { reservation: reservation });
    };

    const renderReservationItem = (item) => (
        <View key={item._id} style={styles.reservationItem}>
            <TouchableOpacity style={styles.buttonToscript} onPress={() => handleButtonPress(item)}>
                <View style={styles.flexList}>
                    <Text style={styles.NameResList}>ร้านอาหาร: {item.restaurant_id.restaurantName}</Text>
                    <Text style={styles.TotalList}>฿ {item.total}</Text>
                </View>
                <Text style={styles.tableList}>โต๊ะ: {item.reservedTables.map(table => table.tableName).join(', ')}</Text>
                <Text style={styles.timeList}>เวลา: {item.createdAt}</Text> 
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.list}>รายการทั้งหมด</Text>
            <Text style={styles.history}>ล่าสุด</Text>
            {reservationList.map(renderReservationItem)}
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,

    },
    reservationItem: {
        width: '100%',
    },
    buttonReserve: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FF914D',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
    flexList: {
        flexDirection: 'row',
        width: '100%',
    },
    NameResList: {
        fontSize:16
    },
    TotalList: {
        marginLeft: 'auto'
    },
    list:{
        textAlign:'center',
        fontSize:20,
        marginBottom:10

    },
    history:{
        fontSize:18, 
        fontWeight:'bold',
        marginBottom:10
    },
    reservationItem:{
        marginTop:20
    }
});

export default ReservationListScreen;
