import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator,TouchableOpacity } from 'react-native';
import axios from 'axios';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const UserHelpScreen = ({navigation}) => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await axios.get(`${apiheader}/helpCenter`);
                setForms(response.data);
            } catch (error) {
                console.error('Error fetching forms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const handleSupport = (formID) => {
        navigation.navigate('userTicket', {formid : formID });
      };
    const renderFormItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={()=>{handleSupport(item._id)}}>
            {item.reservationId && (
                <>
                    <View style={styles.flexTitle}>
                        <Text style={styles.label}>หมายเลขการจอง:</Text>
                        <Text style={styles.value}>{item.reservationId._id}</Text>
                    </View>
                </>
            )}
            <View style={styles.flexTitle}>
                <Text style={styles.label}>ชื่อผู้ใช้:</Text>
                <Text style={styles.value}>{item.username}</Text>
            </View>

            <View style={styles.flexTitle}>
                <Text style={styles.label}>หัวข้อ:</Text>
                <Text style={styles.value}>{item.topic}</Text>
            </View>

        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#00C853" />
            ) : (
                <FlatList
                    data={forms}
                    keyExtractor={(item) => item._id}
                    renderItem={renderFormItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        color: '#888888',
        marginBottom: 4,
        marginRight:10
    },
    value: {
        fontSize: 16,
        color: '#000000',
    },
    flexTitle:{
        flex:1,
        flexDirection:'row',
        alignItems:'center'
    }
});

export default UserHelpScreen;