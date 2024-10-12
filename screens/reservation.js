import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image';
import _ from 'lodash';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';



const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReservationScreen = ({ navigation, route }) => {
    const [request, setRequest] = useState('');
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [selectedTables, setSelectedTables] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    



    const handleGetMenu = () => {
        navigation.navigate('menuTable', {
            restaurantId: route.params.restaurantId,
            restaurant: restaurantDetails,
            selectedTables: selectedTables,
        });
    };

    const fetchRestaurantDetails = async () => {
        try {
            if (route.params && route.params.restaurantId) {

                const response = await axios.get(apiheader + '/restaurants/' + route.params.restaurantId);
                const result = await response.data;
                setRestaurantDetails(result);
            } else {
                console.error("Route params or restaurantId is undefined");
            }
        } catch (error) {
            console.error(error);
        }
    };
    const fetchCart = async () => {
        try {
            const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
            const username = login.username
            const response = await axios.get(apiheader + '/cart/getCartByUsername/' + username + "/" + route.params.restaurantId);
            const result = await response.data;

            if (result) {

                setCartItems(result)
            }
        } catch (error) {
            console.error(error);
        }
    };
    const fetchDeleteCart = async (id) => {
        try {
            const response = await axios.get(apiheader + '/cart/deleteCart/' + id);
            const result = await response.data;
            
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReserveTables = async () => {
        console.log(selectedTables)
        try {
            const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
            const username = login.username
            const obj = { reservedTables: selectedTables, username: username, restaurant_id: restaurantDetails._id}
            const response = await axios.post(apiheader + '/reservation/reserveTables/', obj);
            const result = await response.data;
            if(result.status=="reserved succesfully"){
                ToastAndroid.showWithGravityAndOffset('จองเสร็จสิ้น!.',ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50)
                navigation.navigate('tab');
                

            }
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCart();
        }, [])
    );

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
                                index === selectedTables.length - 1 ? (
                                    <Text key={index}>{item.tableName}</Text>
                                ) : (
                                    <Text key={index}>{item.tableName}, </Text>
                                )
                            ))}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleGetMenu}>
                        <Text style={styles.buttonText}>สั่งอาหารล่วงหน้า</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.rq}>ความต้องการเพิ่มเติม</Text>

                {cartItems[0] === undefined ? (
                    <Text style={styles.selectedTables}>-</Text>
                ) : (
                    Object.values(_.groupBy(cartItems, item => item.selectedTables.map(table => table._id).join())).map(group => (
                        <View key={group[0].selectedTables.map(table => table._id).join()}>
                            <View style={styles.MenuContainer}>
                                <View style={styles.MenuCart}>
                                    {group.map((item, index) => (
                                        <View key={index}>
                                            <View key={index}>

                                            </View>
                                            {index === 0 && (
                                                <View style={styles.listContainer}>
                                                    <Text style={styles.tableTitle}> {item.selectedTables.length > 1 ?
                                                        <Text>โต๊ะรวม</Text> : item.selectedTables.map((table, index) => <Text key={index}>โต๊ะ {table.tableName}</Text>)}
                                                    </Text>
                                                    <View style={styles.MenuTitle}>

                                                        <View style={styles.MenuLi1}>
                                                            <Text style={styles.Ui}>เมนู</Text>
                                                        </View>
                                                        <View style={styles.MenuLi2}>
                                                            <Text style={styles.Ui}>จำนวน</Text>
                                                        </View>
                                                        <View style={styles.MenuLi3}>
                                                            <Text style={styles.Ui}>ราคา</Text>
                                                        </View>
                                                        <View style={styles.MenuLi4}>
                                                            <Text style={styles.Ui}></Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                            <View style={styles.MenuTitle}>
                                                <View style={styles.MenuLi1}>
                                                    <View style={styles.flexList}>
                                                        <Text style={styles.menuNameTitle}>{item.selectedMenuItem.menuName}</Text>
                                                        {item.selectedAddons.map((addon, addonIndex) => (
                                                            <Text key={addonIndex} style={styles.addonTitle}>{addon.AddOnName}</Text>
                                                        ))}
                                                    </View>
                                                </View>
                                                <View style={styles.MenuLi2}>
                                                    <Text style={styles.Ui}>{item.Count}</Text>
                                                </View>
                                                <View style={styles.MenuLi3}>
                                                    <Text style={styles.Ui}>{item.totalPrice}</Text>
                                                </View>
                                                <View style={styles.MenuLi4}>
                                                    <TouchableOpacity onPress={() => { fetchDeleteCart(item._id);fetchCart(); }}>
                                                        <Text style={styles.Delete}>ลบ</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.buttonReserve} onPress={() => { fetchReserveTables() }} >
                <Text style={styles.buttonText}>ยืนยันการจอง</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: 'white'
    },
    restaurantContainer: {
        flexDirection: 'row',
        margin: 20,
        marginTop: 30,
        alignItems: 'flex-start',
    },
    restaurantContainer2: {
        width: '40%'
    },
    MenuContainer: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 15

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
        alignSelf: 'flex-end',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    buttonReserve: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FF914D',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
        width: '95%',
        marginBottom: 15
    },
    rq: {
        marginTop: 10,
        marginLeft: 25
    },
    reservationDataContainer: {
        margin: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD'
    },
    MenuTitle: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 10
    },
    MenuLi1: {
        flex: 4,
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
    Ui: {
        textAlign: 'center'
    },
    Delete: {
        textAlign: 'right',
        color: 'red'
    },
    flexList: {
        flexDirection: 'row',

    },
    menuNameTitle: {
        width: '60%'
    },
    addonTitle: {
        color: 'grey'
    },
    listContainer: {
        marginTop: 15
    }
});

export default ReservationScreen;
