import { Text, View, SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const Promotion = ({ navigation,route }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const totalPrice = route?.params?.totalPrice || 0;
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get(apiheader + '/promotion/coupon');
                setCoupons(response.data);
            } catch (error) {
                console.error('Error fetching promotions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    const renderPromotionCard = (item) => {
        const isDisabled = totalPrice < item.minCount;
    
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isDisabled && styles.disabledCard, // ใช้สีเทาเมื่อไม่ผ่านเงื่อนไข
                ]}
                key={item._id}
                onPress={() => !isDisabled && handleCouponSelect(item)} // ปิดการใช้งานถ้าไม่ผ่าน
                disabled={isDisabled}
            >
                {item.image && (
                    <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={[styles.cardImage,isDisabled && styles.imgDisabledCard]} />
                )}
                <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isDisabled && styles.name,isDisabled && styles.TextDisabledCard]}>[{item.code}]</Text>
                    <Text style={[styles.cardTitle, isDisabled && styles.TextDisabledCard]}>{item.name}</Text>
                    <Text  style={styles.cardDescription}>เมื่อชำระขั้นต่ำ ฿{item.minCount}</Text>
                    {/* <Text style={styles.cardDate}>
                        {`${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`}
                    </Text> */}
                </View>
            </TouchableOpacity>
        );
    };
const handleCouponSelect = (coupon) => {
    navigation.navigate('reserve', { selectedCoupon: coupon });
};

return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.promotionButton} onPress={handleCouponSelect}>
            <Text style={styles.addPromotionButton}>ใส่รหัสคูปอง</Text>
        </TouchableOpacity>

        {loading ? (
            <ActivityIndicator size="large" color="orange" style={styles.loader} />
        ) : (
            <TouchableOpacity style={styles.listContainer}>
                {coupons.map((item) => renderPromotionCard(item))}
            </TouchableOpacity>
        )}
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 10,
    },
    promotionButton: {
        alignSelf: 'flex-end',
        padding: 10,
        backgroundColor: 'orange',
        borderRadius: 10,
        margin: 10,
    },
    addPromotionButton: {
        color: 'white',
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 10,
    },
    card: {
        flexDirection: 'row',
        borderLeftWidth: 10,
        borderLeftColor: 'orange',
        borderRadius: 10,
        marginHorizontal: 5,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
        alignItems: 'center'
    },
    cardImage: {
        width: 120,
        height: 120
    },
    cardContent: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    cardDescription: {
        color: 'gray',
        marginTop:10
    },
    cardDiscount: {
        color: 'green'
    },
    cardDate: {
        color: 'gray'
    },
    disabledCard: {
        backgroundColor: '#d3d3d3', 
        borderLeftColor: '#a9a9a9', 
    },
    TextDisabledCard:{
        color:'gray'
    },
    imgDisabledCard:{
        opacity: 0.6,
    }
});

export default Promotion;
