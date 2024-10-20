import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';



const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReservationListScreen = ({ route, navigation }) => {
    const [reservationList, setReservationList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReservations = async () => {
        setLoading(true);

        try {
            const userCredentials = await SecureStore.getItemAsync('userCredentials');
            if (!userCredentials) {
                
                navigation.navigate('profile');
                return; 
            }
            const { username } = JSON.parse(userCredentials);
            if (!username) {
               
                navigation.navigate('profile');
                return; 
            }
    
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };
    const renderReservationItem = (item) => (
        <View key={item._id} style={styles.reservationItem}>

            <TouchableOpacity style={styles.buttonToscript} onPress={() => handleButtonPress(item)}>
                <View style={styles.flexList}>
                    <View style={styles.logo}>
                        <Image style={styles.imgres} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item.restaurant_id._id }} />
                    </View>
                    <View style={styles.box}>
                        <View style={styles.flexLists}>
                            <Text style={styles.NameResList}>{item.restaurant_id.restaurantName}</Text>
                            <Text style={[styles.status,
                            item.status === "ยืนยันแล้ว" && { backgroundColor: '#1FD46D' },
                            item.status === "ยกเลิกการจองแล้ว" && { backgroundColor: 'gray' }]}>{item.status}</Text>

                        </View>

                        <View style={styles.flexList} >
                            <Image
                                style={styles.logoTable}
                                source={require('../assets/images/table.png')}
                                tintColor={"gray"}

                            />
                            <Text style={styles.tableList}>{item.reservedTables.map(table => table.tableName).join(', ')}</Text>
                        </View>

                        <View style={styles.flexListss}>
                            <Text style={styles.timeList}> {formatDate(item.createdAt)}</Text>
                            <Text style={styles.TotalList}>฿ {item.total}</Text>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient style={styles.header}
                colors={['#FB992C', '#EC7A45']} start={{ x: 0.2, y: 0.8 }}>
                <View style={styles.flexheader}>
                    <Text style={styles.home}>ประวัติการจอง</Text>
                </View>
            </LinearGradient>
            <View style={styles.reservationListContainer}>
                <Text style={styles.history}>ล่าสุด</Text>
                {reservationList.map(renderReservationItem)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    header: {
        width: '100%',
        paddingTop: 50,
        paddingBottom: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10

    },
    flexheader: {
        flexDirection: 'row',
        marginLeft: 20,
        marginRight: 20,
    },
    home: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    reservationListContainer: {
        margin: 10
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
        flexDirection: 'row'
    },
    flexLists: {
        flexDirection: 'row',
        alignItems: 'center'

    },
    flexListss:{
         flexDirection: 'row',
        alignItems: 'center',
        marginTop:10
    },
    box: {
        flex: 1,
        alignSelf: 'center',
        marginLeft: 15,
    },
    logo: {
        width: '25%',
    },
    imgres: {
        width:'100%',
        height:100,
        margin:'auto'
    },
    NameResList: {
        fontSize: 18,
        color: '#FF914D',
        fontWeight: 'bold',
    },
    status: {
        fontSize: 15,
        fontWeight:'bold',
        color: 'white',
        marginLeft: 'auto',
        backgroundColor:'yellow',
        padding:5,
        paddingLeft:15,
        paddingRight:15,
        borderRadius:20

    },
    TotalList: {
        marginLeft: 'auto',
        fontSize:18,
        fontWeight:'bold'
    },
    timeList: {
    },
    list: {
        textAlign: 'center',
        fontSize: 20,
        marginBottom: 10

    },
    history: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop:10,
    
    },
    reservationItem: {
        marginTop: 20
    },
    buttonToscript: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    },
    logoTable: {
        width: 25,
        height: 25,
        marginTop: 10
    },
    tableList: {
        marginTop: 10

    },

});

export default ReservationListScreen;
