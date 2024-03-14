import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuAddonScreen = ({ route }) => {
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);

    useEffect(() => {
        setSelectedMenuItem(route.params.selectedMenuItem);
        setSelectedTables(route.params.selectedTables || []);
    }, [route.params.selectedMenuItem, route.params.selectedTables]);


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {selectedMenuItem && (
                    <Image style={styles.backgroundImage} source={{ uri: apiheader + '/image/getMenuIcon/' + selectedMenuItem._id }} />
                )}
            </View>
            {route.params.navigationSource === 'OrderTogether' ? (
                <Text style={styles.selectedTablesText}>รวมโต๊ะ</Text>
            ) : null}
            {route.params.navigationSource === 'ChooseTable' ? (
                <Text style={styles.selectedTablesText}>
                    โต๊ะ {selectedTables.map((table) => table.tableName).join(', ')}
                </Text>
            ) : null}
            <View style={styles.restaurantListContainer}>
                {selectedMenuItem && (
                    <>
                        <Text style={styles.menuName}>{selectedMenuItem.menuName}</Text>
                        <Text style={styles.price}>฿{selectedMenuItem.price}</Text>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        width: '100%',
        height: "22%",
    },
    restaurantListContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    backgroundImage: {
        width: '100%',
        height: "100%",
    },
    selectedTablesText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuName: {
        fontSize: 16,
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        color: '#FF66AB',
        fontWeight: 'bold',
    },
});

export default MenuAddonScreen;
