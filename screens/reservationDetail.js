import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Directions from 'react-native-maps-directions';
import axios from 'axios';
import io from 'socket.io-client';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader); 

const ReservationDetailScreen = ({ route, navigation }) => {
    const { reservation } = route.params;
    const [location, setLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isArrived, setIsArrived] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(true); 
    const reservationID = reservation._id; 

    useEffect(() => {
        const fetchRestaurantLocation = async () => {
            try {
                const response = await axios.get(apiheader + '/reservation/getLocationById/' + reservation.restaurant_id._id);
                setLocation(response.data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to fetch restaurant location');
            }
        };

        const fetchCurrentLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

           
            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 1, 
                },
                (newLocation) => {
                    setCurrentLocation(newLocation.coords);
                    socket.emit('updateLocation', {
                        reservationID: reservationID,
                        location: newLocation.coords,
                    });
                }
            );

            return () => subscription.remove(); 
        };

        fetchRestaurantLocation();
        fetchCurrentLocation();
    }, [reservation.restaurant_id._id]);

    const locationOn = async () => {
        Alert.alert(
            "ยืนยันการเริ่มเดินทาง",
            "คุณต้องการเริ่มเดินทาง และแสดงตำแหน่งของคุณให้ร้านอาหารทราบหรือไม่?",
            [
                {
                    text: "ยกเลิก",
                    style: "cancel",
                },
                {
                    text: "ยืนยัน",
                    onPress: async () => {
                        try {
                            const response = await axios.put(apiheader + '/reservation/statusLocation/' + reservation._id);
                            if (response.data.status === "statusLocation updated to showLocation") {
                                Alert.alert('คุณสามารถดูตำแหน่งไปยังร้านอาหารได้');
                            }
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to update journey status');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleButtonPress = () => {
        navigation.navigate('Chat', {
            reservationID: reservation._id,
        });
    };

    const checkArrival = (result) => {
        const distance = result.distance;
        if (distance < 0.1) {
            setIsArrived(true);
            setIsMapVisible(false);
            Alert.alert('คุณมาถึงยังที่หมายแล้ว ทานอาหารให้อร่อย');
        }
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
        <View style={styles.container}>
            <ScrollView>
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
                        <View style={styles.MenuLi1}><Text style={styles.Ui}>เมนู</Text></View>
                        <View style={styles.MenuLi2}><Text style={styles.Ui}></Text></View>
                        <View style={styles.MenuLi3}><Text style={styles.Ui}>จำนวน</Text></View>
                        <View style={styles.MenuLi4}><Text style={styles.totalPrice}>ราคา</Text></View>
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

                    {isMapVisible && reservation.statusLocation !== 'hideLocation' && (
                        <MapView
                            style={styles.map}
                            showsUserLocation={true}
                            initialRegion={{
                                latitude: location ? location.coordinates.latitude : 0,
                                longitude: location ? location.coordinates.longitude : 0,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                        >
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.coordinates.latitude,
                                        longitude: location.coordinates.longitude,
                                    }}
                                    title={reservation.restaurant_id.restaurantName}
                                    description={location.address}
                                />
                            )}

                            {currentLocation && location && (
                                <Directions
                                    origin={currentLocation}
                                    destination={{
                                        latitude: location.coordinates.latitude,
                                        longitude: location.coordinates.longitude,
                                    }}
                                    apikey='AIzaSyC_fdB6VOZvieVkKPSHdIFhIlVuhhXynyw'
                                    strokeWidth={5} 
                                    strokeColor="#FF914D" 
                                    onReady={checkArrival} 
                                />
                            )}
                        </MapView>
                    )}

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

            {reservation.status === "ยืนยันแล้ว" && (
                <View style={styles.layuotButton}>
                    <TouchableOpacity style={styles.buttonGotores} onPress={locationOn}>
                        <Text style={styles.buttonGotoresText}>เริ่มเดินทาง</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    restaurantContainer: {
        flex: 1,
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
        flexDirection: 'row',
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
    },
    layuotButton: {
        alignSelf: 'flex-end',
        borderRadius: 10,
        padding: 10,
    },
    buttonGotores: {
        backgroundColor: '#FF914D',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    buttonGotoresText: {
        color: 'white',
        fontWeight: 'bold',
    },
    map: {
        width: '100%',
        height: 300,
        marginVertical: 20,
    }
});

export default ReservationDetailScreen;
