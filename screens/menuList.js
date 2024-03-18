import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuList = ({ route ,navigation }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);


    const handleSetAddon = (selectedMenuItem) => {
        navigation.navigate('menuAddon', { 
            restaurantId: route.params.restaurantId,
            navigationSource: route.params.navigationSource,
            selectedMenuItem: selectedMenuItem,
            selectedTables: selectedTables,
        });

    };


    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${apiheader}/menus/getMenus/${route.params.restaurantId}`);
            const result = await response.data;
            setMenuItems(result);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchMenuItems();
        setSelectedTables(route.params.selectedTables || []);
    }, [route.params.restaurantId, route.params.selectedTables]);



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.backgroundImage} source={require('../assets/images/profile.png')} />
            </View>
            {route.params.navigationSource === 'OrderTogether' ? (
                <Text style={styles.selectedTablesText}>รวมโต๊ะ</Text>
            ) : null}
            {route.params.navigationSource === 'SingleTable' ? (

                <Text style={styles.selectedTablesText}>
                    โต๊ะ {selectedTables.map((table) => table.tableName).join(', ')}
                </Text>
            ) : null}

            {menuItems.length === 0 && (
                <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>ยังไม่มีเมนูอาหารในขณะนี้</Text>
                </View>



            )}
            <View style={styles.restaurantListContainer}>
            {menuItems && menuItems.map((item, index) => (
                        <TouchableOpacity style={styles.menubox}
                        onPress={() => handleSetAddon(item)}
                            key={item._id}
                        >
                            <View style={styles.card}>
                                <Image style={styles.logo} source={{ uri: apiheader + '/image/getMenuIcon/' + item._id }} />
                                <View style={styles.menuItem}>
                                    <Text style={styles.menuName}>{item.menuName}</Text>
                                    <Text style={styles.price}>฿{item.price}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        ))}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'

    },
    menubox: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15
    },
    card: {
        width: '100%',
    },
    header: {
        width: '100%',
        height: "22%"
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
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'cover',
        borderRadius: 5,
        alignSelf: 'center'
    },
    restaurantListContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        backgroundColor:'white'


    },
    backgroundImage: {
        width: '100%',
        height: "100%"
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    noResultsText: {
        fontSize: 18,
        color: 'gray',
    },
    selectedTablesText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default MenuList;
