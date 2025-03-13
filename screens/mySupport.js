import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Text from '../component/Text';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MySupportScreen = ({ navigation, route }) => {
    const username = route.params.user.username
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        try {
            if (!username) {
                setError('ไม่พบชื่อผู้ใช้');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${apiheader}/helpCenter/user/${username}`);
            setReports(response.data);
            console.log(response.data)
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
        finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [])
    );

    return (

        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#000" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : reports.length === 0 ? (
                <Text style={styles.noDataText}>ไม่มีเรื่องที่รายงาน</Text>
            ) : (
                <ScrollView>
                    {reports.map((report) => (
                        <TouchableOpacity
                            key={report._id}
                            style={styles.reportCard}
                        // onPress={() => navigation.navigate('ReportDetail', { report })}
                        >

                            <Text style={styles.topic}>
                                {report?.restaurant_id.restaurantName || 'ไม่พบชื่อร้าน'}
                            </Text>
                            <Text style={styles.topic}>{report.topic}</Text>
                            <Text style={styles.details}>{report.details}</Text>
                            <Text style={styles.details}>วันที่: {new Date(report.createdAt).toLocaleString()}</Text>

                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    reportCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    topic: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#666',
    },

});

export default MySupportScreen;
