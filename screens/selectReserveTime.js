import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../component/Text';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment-timezone';
import { AntDesign } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import 'moment/locale/th';
moment.locale('th');

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const ReserveTime = ({ navigation, route }) => {
    const [availableHours, setAvailableHours] = useState([]);
    const [availableEndTimes, setAvailableEndTimes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reservedTimes, setReservedTimes] = useState({});
    const [expandedTables, setExpandedTables] = useState({});

    useEffect(() => {
        fetchReservedTimes();
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userCredentials = await SecureStore.getItemAsync('userCredentials');
            setIsLoggedIn(!!userCredentials);
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    const fetchReservedTimes = async () => {
        try {
            const response = await axios.get(`${apiheader}/reservation/getReservedTimes/${route.params.restaurantId}`);
            setReservedTimes(response.data);
        } catch (error) {
            console.error('Error fetching reserved times:', error);
        }
    };

    useEffect(() => {
        calculateAvailableTimes();
    }, [reservedTimes]);
    const calculateAvailableTimes = () => {
        const currentTime = moment.tz('Asia/Bangkok');
        const currentHour = currentTime.hours();
        let availableTimes = [];
        let reservedHours = new Set();

        if (Object.keys(reservedTimes).length > 0) {
            route.params.selectedTables.forEach((table) => {
                reservedTimes[table._id]?.forEach((time) => {
                    const reservedStart = moment(time.startTime).utc().hours();
                    const reservedEnd = moment(time.endTime).utc().hours();
                    for (let i = reservedStart; i < reservedEnd; i++) {
                        reservedHours.add(i);
                    }
                });
            });
        }

        // Ensure available hours are generated, even if no reservations exist
        for (let i = currentHour + 1; i <= 24; i++) {
            if (!reservedHours.has(i)) {
                availableTimes.push({ label: `${i}:00`, value: i });
            }
        }

        setAvailableHours(availableTimes);

        // Auto-set available end times if there's an available start time
        if (availableTimes.length > 0) {
            updateAvailableEndTimes(availableTimes[0].value);
        }
    };


    const updateAvailableEndTimes = (selectedStartTime) => {
        let availableEndTimesList = [];
        let reservedEndHours = new Set();

        // Get reserved start hours that might affect end times
        route.params.selectedTables.forEach((table) => {
            reservedTimes[table._id]?.forEach((time) => {
                const reservedStart = moment(time.startTime).utc().hours();
                if (reservedStart > selectedStartTime) {  // Ensure we check after start time
                    reservedEndHours.add(reservedStart);
                }
            });
        });

        // Generate available end times (Allow selecting 16:00)
        for (let i = selectedStartTime + 1; i <= 24; i++) {
            availableEndTimesList.push({ label: `${i}:00`, value: i });
            if (reservedEndHours.has(i)) break; // Stop when we hit a reserved slot
        }

        setAvailableEndTimes(availableEndTimesList);
    };

    const handleStartTimeChange = (value) => {
        setStartTime(value);
        setEndTime(null);
        updateAvailableEndTimes(value);
    };

    const handleSubmit = async () => {
        if (!startTime || !endTime || endTime <= startTime) {
            alert("กรุณาเลือกช่วงเวลาที่ถูกต้อง");
            return;
        }

        if (!isLoggedIn) {
            return navigation.navigate('profile');
        }

        const currentDate = moment.tz('Asia/Bangkok').format('YYYY-MM-DD');
        const fullStartTime = `${currentDate} ${startTime}:00:00`;
        const fullEndTime = `${currentDate} ${endTime}:00:00`;

        try {
            const response = await axios.post(`${apiheader}/tables/checkconflictedreservedTables`, {
                restaurant_id: route.params.restaurantId,
                reservedTables: route.params.selectedTables,
                startTime: fullStartTime,
                endTime: fullEndTime
            });

            if (response.status === 200) {
                navigation.navigate('reserve', {
                    restaurantId: route.params.restaurantId,
                    restaurantName: route.params.restaurantName,
                    selectedTables: route.params.selectedTables,
                    startTime: fullStartTime,
                    endTime: fullEndTime
                });
            }
        } catch (error) {
            alert(error.response?.status === 409 ? "กรุณาเลือกเวลาอื่น มีเวลาที่ซ้ำกัน." : "เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>เลือกเวลาจอง</Text>
            <Text>จากเวลา</Text>
            <RNPickerSelect
                onValueChange={handleStartTimeChange}
                items={availableHours}
                value={startTime}
                placeholder={{ label: 'เลือกเวลาเริ่ม...', value: null }}
                style={pickerSelectStyles.inputAndroid}
            />
            {startTime !== null && availableEndTimes.length > 0 && (
                <View>
                    <Text>ถึง</Text>


                    <RNPickerSelect
                        onValueChange={setEndTime}
                        items={availableEndTimes}
                        value={endTime}
                        placeholder={{ label: 'เลือกเวลาสิ้นสุด', value: null }}
                        style={pickerSelectStyles.inputAndroid}
                    />
                </View>
            )}

            <View style={styles.tableList}>
            <Text style={styles.title}>เวลาที่ถูกจอง</Text>

                {route.params.selectedTables.map((table) => (
                    <View key={table._id} style={styles.tableItem}>
                        <TouchableOpacity
                            onPress={() => setExpandedTables(prev => ({ ...prev, [table._id]: !prev[table._id] }))}
                            style={styles.tableHeader}
                        >
                            <Text style={styles.tableTitle}>{table.text}</Text>
                            <AntDesign name={expandedTables[table._id] ? "up" : "down"} size={20} color="black" />
                        </TouchableOpacity>
                        {expandedTables[table._id] && (
                            <View style={styles.reservedTimes}>
                                {reservedTimes[table._id]?.length > 0 ? (
                                    reservedTimes[table._id].map((time, index) => (
                                        <Text key={index}>
                                            {moment(time.startTime).utc().format('Do MMMM HH:mm')} - {moment(time.endTime).utc().format('Do MMMM HH:mm')}
                                        </Text>
                                    ))
                                ) : (
                                    <Text>ไม่มีเวลาที่จองแล้ว</Text>
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitText}>ยืนยัน</Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16, marginTop: 30 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    tableList: { marginBottom: 20 },
    tableItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
    tableTitle: { fontSize: 18, fontWeight: 'bold' },
    reservedTimes: { paddingLeft: 15, paddingBottom: 10 },
    submitButton: { backgroundColor: '#FF7A00', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
    submitText: { fontSize: 18, color: '#fff' }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: { fontSize: 18, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginBottom: 20, borderRadius: 8 },
    inputAndroid: { fontSize: 18, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginBottom: 20, borderRadius: 8 }
});
export default ReserveTime;
