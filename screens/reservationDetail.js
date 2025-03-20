import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Directions from 'react-native-maps-directions';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import io from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import Text from '../component/Text';
import moment from 'moment-timezone';
const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const ReservationDetailScreen = ({ route, navigation }) => {
    const { reservation } = route.params;
    const [statusLocation, setStatusLocation] = useState(reservation.statusLocation);
    const [location, setLocation] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const mapRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isArrived, setIsArrived] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(true);
    const reservationID = reservation._id;
    const [showPopup, setShowPopup] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);

    const selectImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };
    const fetchRestaurantLocation = async () => {
        try {
            const response = await axios.get(apiheader + '/reservation/getLocationById/' + reservation.restaurant_id._id);
            setLocation(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch restaurant location');
        }
    };
    useEffect(() => {


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

    const cancelReservation = async () => {
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
                            console.log(error);
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
                                setStatusLocation("showLocation");
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
    const uploadSlip = async () => {
        if (!selectedImage) return;

        try {
            setUploading(true);
            setUploadResult(null);
            setError(null);
            console.log(reservation.total)
            const fileBuffer = await fetch(selectedImage).then((res) => res.arrayBuffer());
            const fileName = selectedImage.split('/').pop();
            const totalP = reservation.total
            const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
            const username = login.username;
            const reservationId = reservation._id
            const restaurant_id = restaurantDetails._id

            console.log()
            socket.emit('uploadSlip', { fileBuffer, fileName, totalP, username, reservationId,restaurant_id});

            socket.on('uploadSlipSuccess', (response) => {
                setUploading(false);
                setUploadResult(`${response.message}`);
                setModalVisible(true);
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.navigate('tab', { reservation: response.reservationId });
                }, 5000);
            });

            socket.on('uploadSlipError', (error) => {
                setUploading(false);
                setError(`${error.message}`);
            });
        } catch (e) {
            setUploading(false);
            setError(`Error: ${e.message}`);
        }
    };
    const fetchRestaurantDetails = async () => {
        try {
          const response = await axios.get(apiheader + '/restaurants/' + reservation.restaurant_id._id);
          const result = await response.data;
          console.log(result)
          setRestaurantDetails(result);
        } catch (error) {
          console.error(error);
        }
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
    useEffect(() => {

        const genqr = async (amount) => {
            try {
                const response = await axios.post(apiheader + '/payment/createQRpayment', {
                    amount: amount,
                });
                if (response.data.qrCodeUrl) {
                    setQrCode(response.data.qrCodeUrl);
                } else {
                    console.log('Error generating QR Code');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        if (!reservation?.Payment || reservation.Payment.length === 0) {
            genqr(reservation.totalPrice)
        }
        fetchRestaurantDetails()
    }, []);
    if (!reservation) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>รายละเอียดการจอง</Text>
                <Text style={styles.error}>ข้อมูลการจองไม่ถูกต้อง</Text>
            </View>
        );
    }
    useEffect(() => {
        if (mapRef.current && location && currentLocation) {
            mapRef.current.fitToCoordinates(
                [
                    {
                        latitude: location.coordinates.latitude,
                        longitude: location.coordinates.longitude,
                    },
                    {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                    }
                ],
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
    }, [location, currentLocation]);

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.restaurantContainer}>
                    <View style={[
                        styles.details,
                        reservation.status === "ยกเลิกการจองแล้ว" ? { borderColor: 'red' } : // Case 4: Canceled reservation
                            (!reservation.Payment || reservation.Payment.length === 0) ? { borderColor: 'orange' } : // Case 1 & 2: Waiting for payment
                                reservation.status === "ยืนยันแล้ว" ? { borderColor: 'green' } : // Case 3: Confirmed and paid
                                    {} // Default (no extra styling)
                    ]}>
                        <View style={styles.flextitleheader}>
                            <Text style={styles.restaurantName}>{reservation.restaurant_id.restaurantName}</Text>
                            <Text style={styles.timeList}>
                                {moment(reservation.createdAt).tz('Asia/Bangkok').format('DD-MM-YYYY HH:mm')}
                            </Text>
                        </View>

                        <Text>รหัสการจอง: {reservation._id}</Text>
                        <Text>โต๊ะ: {reservation.reservedTables.map(table => table.text).join(', ')}</Text>
                        <Text>เวลาที่จอง: {moment(reservation.startTime).utc().format('HH:mm')} - {moment(reservation.endTime).utc().format('HH:mm')}</Text>

                        <Text style={[
                            styles.statusres,
                            reservation.status === "ยกเลิกการจองแล้ว" ? { color: 'red' } : // Case 4: Canceled reservation
                                (!reservation.Payment || reservation.Payment.length === 0) ? { color: 'orange' } : // Case 1 & 2: Waiting for payment
                                    reservation.status === "ยืนยันแล้ว" ? { color: 'green' } : // Case 3: Confirmed and paid
                                        {} // Default (no extra styling)
                        ]}>
                            {reservation.status === "ยกเลิกการจองแล้ว" ? "ยกเลิกแล้ว" :
                                (!reservation.Payment || reservation.Payment.length === 0) ? "รอการจ่ายเงิน" :
                                    reservation.status}
                        </Text>
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

                    {statusLocation !== 'hideLocation' && (

                        <View style={styles.mapview}>
                            <MapView
                                ref={mapRef}
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

                    {reservation.status !== "ยกเลิกการจองแล้ว" && qrCode && (
                        <View style={styles.QRcode}>
                            <Text style={styles.QRcodeTitle}>สแกน QR code เพื่อชำระเงิน</Text>
                            <Image source={{ uri: qrCode }} style={styles.QRcodeimg} />

                            <View>
                                {selectedImage && (
                                    <Image source={{ uri: selectedImage }} style={styles.QRcodeimg} />
                                )}

                                <Text style={styles.QRcodeDec}>
                                    การชำระเงินทำการ "กดส่งสลิป" เมื่อเสร็จสิ้นแล้วให้ทำการ "กดตรวจสอบ"
                                    หากตรวจสอบผ่านแล้วจะขึ้นสถานะว่า "ชำระเงินเสร็จสิ้น"
                                </Text>

                                {error && (
                                    <Text style={styles.errorText}>{error}</Text>
                                )}

                                <View style={styles.flexButton}>
                                    <TouchableOpacity onPress={selectImage} style={styles.sendSlip}>
                                        <Text style={styles.SlipTxt}>ส่งสลิป</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={uploadSlip} style={styles.verifySlip}>
                                        {uploading && (
                                            <ActivityIndicator size="large" color="#0000ff" />
                                        )}
                                        <Text style={styles.SlipTxt}>ตรวจสอบ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {reservation.status === "ยืนยันแล้ว" && statusLocation !== "showLocation" && (
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
        backgroundColor: 'white',

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
        marginTop: 20,

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
    mapview: {
        padding: 5,
        backgroundColor: 'white',
        marginTop: 20,
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
    }, QRcode: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 60
    },
    QRcodeimg: {
        width: 200,
        height: 200,
        margin: 'auto'
    },
    QRcodeTitle: {
        textAlign: 'center',
        fontSize: 18
    }, sendSlip: {
        backgroundColor: 'green',
        width: '30%',
        padding: 10,
        margin: 5,
        borderRadius: 10
    }, SlipTxt: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    }, verifySlip: {
        backgroundColor: 'orange',
        width: '30%',
        padding: 10,
        margin: 5,
        borderRadius: 10

    }, flexButton: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
});

export default ReservationDetailScreen;
