import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert ,Modal} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Directions from 'react-native-maps-directions';
import axios from 'axios';
import io from 'socket.io-client';
import Text from '../component/Text';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const ReservationDetailScreen = ({ route, navigation }) => {
    const { reservation } = route.params;
    const [location, setLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isArrived, setIsArrived] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(true);
    const reservationID = reservation._id;
    const [showPopup, setShowPopup] = useState(false);
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
    
    const cancelReservation = async()=>{
        Alert.alert(
            "คุณต้องการยกเลิกการจองหรือไม่",
            "หากยกเลิกการจองไปแล้วคุณจะไม่สามารถ ทำอะไรกับการจองนี้ได้อีก",
            [
                {
                    text: "ยกเลิก",
                    style: "cancel",
                },
                {
                    text: "ยืนยัน",
                    onPress: async () => {
                        try {
                            const response = await axios.put(apiheader + '/reservation/cancelReservation/' + reservationID);
                            const result = await response.data;
                            navigation.goBack();
                        } catch (error) {
                            console.error(error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

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
        }
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

    useEffect(() => {
        if (isArrived) {
          setShowPopup(true);
          const timer = setTimeout(() => {
            setShowPopup(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }, [isArrived])

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
                    <View style={[styles.details,
                    reservation.status === "ยืนยันแล้ว" && { borderColor: 'green' },
                    reservation.status === "ยกเลิกการจองแล้ว" && { borderColor: 'red' }]}>
                        <View style={styles.flextitleheader}>
                            <Text style={styles.restaurantName}>{reservation.restaurant_id.restaurantName}</Text>
                            <Text style={styles.timeList}> {formatDate(reservation.createdAt)}</Text>
                        </View>
                        <Text>รหัสการจอง: {reservation._id}</Text>
                        <Text>โต๊ะ: {reservation.reservedTables.map(table => table.text).join(', ')}</Text>
                        <Text style={[styles.statusres,
                        reservation.status === "ยืนยันแล้ว" && { color: 'green' },
                        reservation.status === "ยกเลิกการจองแล้ว" && { color: 'red' }]}>{reservation.status}</Text>
                    </View>
                    <View style={styles.cardmanu}>
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
                                            <Text style={styles.Count}>{order.Count}</Text>
                                        </View>
                                        <View style={styles.MenuLi4}>
                                            <Text style={styles.totalPrice}>฿{order.totalPrice}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                        <Text style={styles.totalReservation}>ราคารวม ฿{reservation.total}</Text>
                    </View>
                           
                    {isMapVisible && reservation.statusLocation !== 'hideLocation' && (
                       
                        <View  style={styles.mapview}>
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
                                >
                                    <Image source={require('../assets/images/restaurant.png')} style={{ height: 40, width: 40 }} />
                                </Marker>
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
                        </View>
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
            {reservation.status === "รอการยืนยัน" && (
                <View style={styles.layuotButton2}>
                    <TouchableOpacity style={styles.buttonGotores2} onPress={cancelReservation}>
                        <Text style={styles.buttonGotoresText2}>ยกเลิกการจอง</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Modal
                           animationType="fade"
                           transparent={true}
                           visible={showPopup}
                           onRequestClose={() => setShowPopup(false)} 
                         >
                           <View style={styles.modalContainer}>
                             <View style={styles.modalView}>
                               <Text style={styles.modalText}>คุณมาถึงร้านอาหารแล้ว ขอให้เป็นมื้อที่ดี</Text>
                             </View>
                           </View>
                         </Modal>
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white',

    },
    restaurantContainer: {
        flex: 1,
        padding: 20,

    },
    cardmanu: {
        backgroundColor: 'white',
        padding: 10,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    statusres: {
        color: 'blue',
        fontSize: 16,
        fontWeight: 'bold',
    },
    details: {
        marginBottom: 20,
        borderLeftWidth: 10,
        borderColor: 'gray',
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 10,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    },
    flextitleheader: {
        flexDirection: 'row',
        marginBottom: 5
    },
    restaurantName: {
        fontSize: 16,
        color: '#FF914D',
        fontWeight: 'bold'
    },
    timeList: {
        fontSize: 16,
        color: 'gray',
        marginLeft: 'auto'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',

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
        marginTop:20,

    },
    image: {
        width: 50,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 50
    },
    buttonText: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        color: 'gray',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    },
    buttonChat: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 5,

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
    layuotButton2: {
        alignSelf: 'flex-end',
        borderRadius: 10,
        padding: 10,
        
    },
    buttonGotores2: {
        backgroundColor: 'red',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    buttonGotoresText2: {
        color: 'white',
        fontWeight: 'bold',
    },
    map: {
        width: '100%',
        height: 300,
        
    },
    mapview:{
        padding:5,
        backgroundColor:'white',
        marginTop:20,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
      },
      modalView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        padding: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 0, 
    },
      modalText: {
        fontSize: 18,
        textAlign: 'center',
      },
});

export default ReservationDetailScreen;
