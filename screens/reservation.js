import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid, ActivityIndicator, Modal } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import _ from 'lodash';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Text from '../component/Text';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment-timezone';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const ReservationScreen = ({ navigation, route }) => {
    const [request, setRequest] = useState('');
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [selectedTables, setSelectedTables] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

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
    const uploadSlip = async () => {
        if (!selectedImage) return;

        try {
            setUploading(true); // แสดงสถานะกำลังอัปโหลด
            setUploadResult(null); // ล้างข้อความเก่า
            setError(null); // ล้างข้อความข้อผิดพลาดเก่า

            const fileBuffer = await fetch(selectedImage).then((res) => res.arrayBuffer());
            const fileName = selectedImage.split('/').pop();
            const totalP = totalPrice;
            const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
            const username = login.username;

            // ส่งข้อมูลไปที่ Socket
            socket.emit('uploadSlip', { fileBuffer, fileName, totalP, username });

            // ฟังผลลัพธ์สำเร็จ
            socket.on('uploadSlipSuccess', (response) => {
                setUploading(false);
                setUploadResult(`${response.message}`);
                setModalVisible(true);
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.navigate('tab', { reservation: response.reservationId });
                }, 5000);
            });

            // ฟังผลลัพธ์ข้อผิดพลาด
            socket.on('uploadSlipError', (error) => {
                setUploading(false);
                setError(`${error.message}`);
            });
        } catch (e) {
            setUploading(false);
            setError(`Error: ${e.message}`);
        }
    };


    const handleGetMenu = () => {
        navigation.navigate('menuTable', {
            restaurantId: route.params.restaurantId,
            restaurant: restaurantDetails,
            selectedTables: selectedTables,
            startTime:route.params.startTime,
            endTime:route.params.endTime
        });
    };
    const handlePromotion = () => {
        navigation.navigate('coupon', {
            restaurantId: route.params.restaurantId,
            totalPrice: totalPriceBeforeDiscount,
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
        if (isProcessing) return; 
        setIsProcessing(true);
        try {
            const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
            const username = login.username
            const totalP = totalPrice;
            const obj = { reservedTables: selectedTables, username: username, restaurant_id: restaurantDetails._id, total: totalP,startTime:route.params.startTime,endTime:route.params.endTime, }
            const response = await axios.post(apiheader + '/reservation/reserveTables/', obj);
            const result = await response.data;
            if (result.status == "reserved successfully") {
                const totalP = totalPrice;
                try {
                    const response = await axios.post(apiheader + '/payment/createQRpayment', {
                        amount: totalP,
                    });
                    if (response.data.qrCodeUrl) {
                        setQrCode(response.data.qrCodeUrl);
                    } else {
                        console.error('Error generating QR Code');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        } catch (error) {
            console.error(error);

        } finally {
            setIsProcessing(false); // คืนสถานะให้สามารถกดได้อีกครั้ง
        }
    };


    useEffect(() => {
        if (route.params?.selectedCoupon) {
            setSelectedCoupon(route.params.selectedCoupon);
        }
    }, [route.params?.selectedCoupon]);

    const totalPriceBeforeDiscount = cartItems.reduce((total, item) => {
        let itemTotal = item.selectedMenuItem.price * (item.Count || 0);
        const addonsTotal = item.selectedAddons.reduce((addonTotal, addon) => addonTotal + addon.price, 0);
        return total + itemTotal + addonsTotal;
    }, 0);

    const discount = selectedCoupon ? selectedCoupon.discount : 0;
    const totalPrice = Math.max(totalPriceBeforeDiscount - discount, 0);


    useFocusEffect(
        React.useCallback(() => {
            fetchCart();
        }, [])
    );

    useEffect(() => {
        fetchRestaurantDetails();
        console.log(route.params)
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
                                    <Text key={index}>{item.text}</Text>
                                ) : (
                                    <Text key={index}>{item.text}, </Text>
                                )
                            ))}
                        </Text>
                        <Text style={styles.selectedTables}>
                            {moment(route.params.startTime).format('HH:mm')} - {moment(route.params.endTime).format('HH:mm')}
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
                                                        <Text>โต๊ะรวม</Text> : item.selectedTables.map((table, index) => <Text key={index}>โต๊ะ {table.text}</Text>)}
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
                                                    <TouchableOpacity onPress={() => { fetchDeleteCart(item._id); fetchCart(); }}>
                                                        <Text style={styles.Delete}>ลบ</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.total}>
                                <Text style={styles.totalPrice}>ราคารวม ฿{totalPriceBeforeDiscount.toFixed(2)}</Text>

                                {selectedCoupon && (
                                    <View>
                                        <View style={styles.flexDiscount}>
                                            <Text style={styles.discountLabel1}>ส่วนลด ({selectedCoupon.name})</Text>
                                            <Text style={styles.discountLabel2}> -฿{discount.toFixed(2)}</Text>
                                        </View>
                                        <Text style={styles.finalPriceLabel}>ราคาสุทธิ: ฿{totalPrice.toFixed(2)}</Text>
                                    </View>

                                )}
                            </View>
                            <View style={styles.Promotion}>
                                <Text style={styles.TextPromotion1}>คูปอง</Text>
                                <TouchableOpacity style={styles.chickTops} onPress={handlePromotion}>
                                    <Text style={styles.TextPromotion2}> {selectedCoupon ? selectedCoupon.code : 'ใช้คูปอง'}</Text>
                                    <Ionicons name="chevron-forward-outline" size={24} color="black" alignSelf='center' marginTop='8' marginRight={10} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.payment}>
                                <Text style={styles.TextPromotion1}>ชำระเงินโดย</Text>
                                <TouchableOpacity style={styles.LayoutPayment}>
                                    <MaterialIcons name="qr-code-2" size={35} color="black" width='10%' />
                                    <Text style={styles.TextPayment}>ชำระผ่าน QR code</Text>
                                    <Ionicons name="chevron-forward-outline" size={24} color="black" alignSelf='center' marginRight={10} marginLeft='auto' />
                                </TouchableOpacity>
                            </View>
                            {qrCode && (
                                <View style={styles.QRcode}>
                                    <Text style={styles.QRcodeTitle}>สแกน QR code เพื่อชำระเงิน</Text>
                                    <Image source={{ uri: qrCode }} style={styles.QRcodeimg} />


                                    <View>
                                        {selectedImage && (
                                            <Image source={{ uri: selectedImage }} style={styles.QRcodeimg} />
                                        )}

                                        <Text style={styles.QRcodeDec}>การชำระเงินทำการ "กดส่งสลิป" เมื่อเสร็จสิ้นแล้วให้ทำการ "กดตรวจสอบ" หากตรวจสอบผ่านแล้วจะขึ้นสถานะว่า "ชำระเงินเสร็จสิ้น" </Text>
                                        {error && (
                                            <Text style={styles.errorText}>{error}</Text>
                                        )}
                                        <View style={styles.flexButton}>
                                            <TouchableOpacity onPress={selectImage} style={styles.sendSlip}>
                                                <Text style={styles.SlipTxt}>ส่งสลิป</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={uploadSlip}
                                                style={styles.verifySlip}
                                            >
                                                {uploading && (<ActivityIndicator size="large" color="#0000ff" />
                                                )}
                                                <Text style={styles.SlipTxt}>ตรวจสอบ</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>


                            )}
                        </View>
                    ))

                )}
            </ScrollView>
            <View style={styles.modal}>
                <Modal visible={isModalVisible} >
                    <View style={styles.layoutModal}>
                        <Image
                            source={require('../assets/images/invoice.png')}
                            style={styles.iconModal}
                        />
                        <Text style={styles.successText}>{uploadResult}</Text>
                    </View>
                </Modal>
            </View>
            <TouchableOpacity
                style={[styles.buttonReserve, { backgroundColor: cartItems.length > 0 ? '#FF914D' : 'gray' }]}
                onPress={() => { fetchReserveTables() }}
                disabled={
                    cartItems.length === 0 ||

                    isProcessing}
            >
                <Text style={styles.buttonText}>
                    {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
                </Text>
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
        fontSize: 20,
        color: '#FF914D'

    },
    selectedTables: {
        marginLeft: 20,
        marginTop: 5,
        fontSize: 16
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
        textAlign: 'center',
        fontSize: 16
    },
    Delete: {
        textAlign: 'right',
        color: 'red'
    },
    flexList: {
        flexDirection: 'row',

    },
    menuNameTitle: {
        width: '60%',
        fontSize: 16

    },
    addonTitle: {
        color: 'grey',
        fontSize: 16

    },
    listContainer: {
        marginTop: 15
    },
    total: {
        marginTop: 20,
        marginBottom: 10
    },
    totalPrice: {
        fontSize: 18,
        textAlign: 'right',
        marginRight: 20,

    },
    payment: {
        borderTopColor: 'gray',
        borderTopWidth: 1
    },
    LayoutPayment: {
        flexDirection: 'row',
        marginLeft: 20,
        marginTop: 5
    },
    TextPayment: {
        alignSelf: 'center',
        fontSize: 16
    },
    Promotion: {
        flexDirection: 'row',
        borderTopColor: 'gray',
        borderTopWidth: 5,
        marginBottom: 10

    },
    TextPromotion1: {
        flex: 1,
        marginTop: 10,
        marginLeft: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    chickTops: {
        flexDirection: 'row'
    },
    TextPromotion2: {
        marginTop: 10,
        color: 'gray'
    },
    QRcode: {
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
    },
    flexButton: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    sendSlip: {
        backgroundColor: 'green',
        width: '30%',
        padding: 10,
        margin: 5,
        borderRadius: 10
    },
    verifySlip: {
        backgroundColor: 'orange',
        width: '30%',
        padding: 10,
        margin: 5,
        borderRadius: 10

    },
    SlipTxt: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    },
    QRcodeDec: {
        marginLeft: 20,
        marginRight: 20,
        fontSize: 15,
        color: 'gray',
        marginTop: 5
    },
    discountLabel1: {
        flex: 1,
        fontSize: 16,
        marginLeft: 20,

    },
    discountLabel2: {
        flex: 1,
        fontSize: 16,
        color: 'red',
        textAlign: 'right',
        marginRight: 20,

    },
    finalPriceLabel: {
        fontSize: 18,
        textAlign: 'right',
        marginRight: 20,
        color: 'green',
        marginTop: 10,
    },
    flexDiscount: {
        flex: 1,
        flexDirection: 'row'
    },
    errorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        marginTop: 10
    },
    layoutModal: {
        width: 300,
        height: 320,
        position: "absolute",
        top: '50%',
        left: '50%',
        transform: "translate(-50%, -50%)"
    },
    iconModal: {
        width: 300,
        height: 300,
        position: "absolute",
        top: '30%',
        left: '50%',
        transform: "translate(-50%, -50%)"
    },
    successText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        position: "absolute",
        bottom: 0,
        left: '50%',
        transform: "translate(-50%, -50%)"
    }


});

export default ReservationScreen;