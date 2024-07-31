import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;


const ReservationDetailScreen = ({ route, navigation }) => {
    const { reservation } = route.params;

    const handleButtonPress = () => {
        navigation.navigate('Chat', {
            reservationID: reservation._id,
        });
    };

    if (!reservation) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>รายละเอียดการจอง</Text>
                <Text style={styles.error}>ข้อมูลการจองไม่ถูกต้อง</Text>
            </View>
        );
    }


    return (
        <ScrollView style={styles.container}>
            <View style={styles.restaurantContainer}>
                <Text style={styles.header}>รายละเอียดการจอง</Text>
                <Text style={[styles.statusres,
                reservation.status === "ยืนยันแล้ว" && { color: 'green' },
                reservation.status === "ยกเลิกการจองแล้ว" && { color: 'red' }]}>{reservation.status}</Text>
                <Text style={styles.restaurantName}>ร้านอาหาร {reservation.restaurant_id.restaurantName}</Text>

                <View style={styles.details}>
                    <Text>รหัสการจอง: {reservation._id}</Text>
                    <Text>เวลา: {reservation.createdAt}</Text>
                    <Text>โต๊ะ: {reservation.reservedTables.map(table => table.tableName).join(', ')}</Text>
                </View>

                <Text style={styles.sectionTitle}>รายการอาหาร</Text>
                <View style={styles.MenuTitle}>

                    <View style={styles.MenuLi1}>
                        <Text style={styles.Ui}>เมนู</Text>
                    </View>
                    <View style={styles.MenuLi2}>
                        <Text style={styles.Ui}></Text>
                    </View>
                    <View style={styles.MenuLi3}>
                        <Text style={styles.Ui}>จำนวน</Text>
                    </View>
                    <View style={styles.MenuLi4}>
                        <Text style={styles.totalPrice}>ราคา</Text>
                    </View>

                </View>

                {reservation.orderedFood.map((order, index) => (
                    <View key={index} style={styles.foodContainer}>

                        <View style={styles.foodDetails}>
                            <View style={styles.MenuTitle}>
                                <View style={styles.MenuLi1}>
                                    {order.selectedMenuItem.map((item, itemIndex) => (
                                        <Text key={itemIndex} style={styles.foodItem}>{item.menuName}</Text>
                                    ))}
                                </View>
                                <View style={styles.MenuLi2}>
                                    {order.selectedAddons.map((addon, addonIndex) => (
                                        <Text key={addonIndex} style={styles.addonItem}>{addon.AddOnName}</Text>
                                    ))}
                                </View>

                                <View style={styles.MenuLi3}>
                                    <Text style={styles.Count}>8</Text>
                                </View>
                                <View style={styles.MenuLi4}>

                                    <Text style={styles.totalPrice}>฿{order.totalPrice}</Text>
                                </View>
                            </View>

                        </View>
                    </View>
                ))}
                <Text style={styles.totalReservation}>ราคารวม ฿{reservation.total}</Text>
                {reservation.status === "ยืนยันแล้ว" && (
                    <TouchableOpacity style={styles.chat} onPress={handleButtonPress}>
                        <Image style={styles.image} source={{ uri: apiheader + '/image/getRestaurantIcon/' + reservation.restaurant_id._id }} />
                        <View style={styles.buttonChat}>
                            <Text style={styles.buttonText}>แชทกับร้านค้า</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    statusres: {
        color: 'blue',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'

    },
    details: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    foodContainer: {
    },
    orderType: {
        fontWeight: 'bold',
    },
    foodDetails: {
    },
    foodHeader: {
        fontWeight: 'bold',
        marginTop: 5,
    },
    foodItem: {

    },
    addonItem: {
    },
    totalPrice: {
        fontWeight: 'bold',
        textAlign: 'right'

    },
    totalReservation: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'right'
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
    MenuTitle: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 10
    },
    MenuLi1: {
        flex: 3,

    },
    MenuLi2: {
        flex: 3,
    },
    MenuLi3: {
        flex: 2,

    },
    MenuLi4: {
        flex: 1,

    },
    Count: {
        marginLeft: 10
    },
    chat: {
        flex: 1,
        flexDirection: 'row'
    },
    image: {
        width: 50,
        height: 50,
        backgroundColor: 'gray',
        borderRadius: 50
    },
    buttonText: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 10,
        color: 'white'
    },
    buttonChat: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 5
    }

});

export default ReservationDetailScreen;
