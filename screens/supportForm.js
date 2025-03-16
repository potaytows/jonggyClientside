import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView,Alert  } from 'react-native';
import Text from '../component/Text';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
const apiheader = process.env.EXPO_PUBLIC_apiURI;

const SupportFormScreen = ({ route , navigation}) => {
    const reservation = route.params.reservation;

    const restaurant_id = reservation.restaurant_id;
    const user = route.params.user
    const [email, setEmail] = useState('');
    const [details, setDetails] = useState('');
    const [topic, setTopic] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'ลืมชำระเงิน', value: 'ลืมชำระเงิน' },
        { label: 'ชำระเงินไม่ครบ', value: 'ชำระเงินไม่ครบ' },
        { label: 'ได้อาหารไม่ครบ', value: 'ได้อาหารไม่ครบ' },
        { label: 'ร้านอาหารหารบริการไม่ดี', value: 'ร้านอาหารหารบริการไม่ดี' },
        { label: 'การชำระเงินมีปัญหา', value: 'การชำระเงินมีปัญหา' },
        { label: 'ปัญหาอื่นๆ', value: 'ปัญหาอื่นๆ' },
    ]);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };
    const confirmSubmit = () => {
        Alert.alert(
            'ยืนยันการส่งข้อมูล', // หัวข้อ
            'คุณต้องการส่งแบบฟอร์มใช่หรือไม่?', // ข้อความ
            [
                { text: 'ยกเลิก', style: 'cancel' }, // ปุ่มยกเลิก
                { text: 'ยืนยัน', onPress: submitForm }, // ปุ่มยืนยัน
            ]
        );
    };
    const submitForm = async () => {
        try {
            if (!email || !topic || !details) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            const response = await axios.post(apiheader + '/helpCenter/supportForm', {
                reservationId: reservation._id,
                username: user.username,
                restaurant_id:restaurant_id,
                email,
                topic,
                details,
                whosend:'user'
            });
            showMessage({
                message: 'ส่งแบบฟอร์มสำเร็จ',
                type: 'success', 
                duration: 3000, 
            });
            navigation.goBack(); 
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('เกิดข้อผิดพลาดในการส่งแบบฟอร์ม');
        }
    };
    useEffect(() => {
        if (user.email) {
            setEmail(user.email);
    console.log(route.params.reservation._id)
    // กำหนดค่าเริ่มต้นให้ state email จาก user.email
        }
    }, [user.email]);
    return (

        <View style={styles.container}>
            {/* ส่วน Report */}
            <View style={styles.reportItem}>
                <Image style={styles.reportImage} source={require('../assets/images/cutlery.png')} />
                <View style={styles.reportDetails}>
                    <Text style={styles.reportTitle}>{reservation.restaurantName}</Text>
                    <Text style={styles.reportDate}>{formatDate(reservation.createdAt)}</Text>
                </View>
                <Text style={styles.reportPrice}>{reservation.total}</Text>
            </View>

            {/* ส่วนแบบฟอร์ม */}
            <View style={styles.formContainer}>
                <Text style={styles.label}>ที่อยู่อีเมลของคุณ</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={text => setEmail(text)}
                    placeholder="example@example.com"
                />

                <Text style={styles.label}>เลือกหัวข้อ</Text>
                <DropDownPicker
                    open={open}
                    value={topic}
                    items={items}
                    setOpen={setOpen}
                    setValue={setTopic}
                    setItems={setItems}
                    placeholder="เลือกหัวข้อ"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                />



                <Text style={styles.label}>รายละเอียดเพิ่มเติม</Text>
                <TextInput
                    style={styles.textArea}
                    value={details}
                    onChangeText={text => setDetails(text)}
                    placeholder="โปรดเขียนอธิบาย"
                    multiline
                    maxLength={1500}
                />


                <TouchableOpacity style={styles.submitButton} onPress={confirmSubmit}>
                    <Text style={styles.submitButtonText}>ส่งแบบฟอร์ม</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
        marginTop: 8,
    },
    reportImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    reportDetails: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 14,
        color: '#000000',
    },
    reportDate: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
    },
    reportPrice: {
        fontSize: 14,
        color: '#000000',
        fontWeight: 'bold',
    },
    formContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 10,
    },
    label: {
        fontSize: 14,
        color: '#000000',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        height: 100,
        backgroundColor: '#FFFFFF',
    },
    uploadButton: {
        backgroundColor: '#E0E0E0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadButtonText: {
        color: '#000000',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#00C853',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
    },
});

export default SupportFormScreen;
