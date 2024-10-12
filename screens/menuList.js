import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MenuAddonScreen from './menuAddon';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuList = ({ route, navigation }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [restaurant, setRestaurant] = useState([]);


    const handleclose = () => {
        fetchCart();
        setIsModalVisible(false);

    };

    const handleSetAddon = (selectedMenuItem) => {
        setSelectedMenuItem(selectedMenuItem);
        setIsModalVisible(true);

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
    useFocusEffect(
        React.useCallback(() => {
            fetchCart();
        }, [])
    );
    useEffect(() => {
        fetchMenuItems();
        setRestaurant(route.params.restaurant);
        setSelectedTables(route.params.selectedTables || []);
    }, [route.params.restaurantId, route.params.selectedTables ,route.params.restaurant]);

    const totalItems = cartItems.reduce((total, item) => total + (item.Count || 0), 0);
    const totalPrice = cartItems.reduce((total, item) => {
        // Base price from the selected menu item
        let itemTotal = item.selectedMenuItem.price * (item.Count || 0);
        // Add price of addons
        const addonsTotal = item.selectedAddons.reduce((addonTotal, addon) => addonTotal + addon.price, 0);
        return total + itemTotal + (addonsTotal * (item.Count || 0)); // Multiply addons total by Count if applicable
    }, 0);


    return (
        <View style={styles.container}>
            <View style={styles.Flextitlemenu}>
                <Text style={styles.restaurantName}>{restaurant.restaurantName}</Text>
                <View style={styles.titlemenu}>
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


                </View>
            </View>
            <Text style={styles.recommend}>เมนูแนะนำ</Text>
            <View style={styles.restaurantListContainer}>

                {menuItems && menuItems.map((item, index) => (
                    <View style={styles.menubox}

                    >
                        <View style={styles.cardspace}>
                            <View style={styles.card}>
                                <Image style={styles.logo} source={{ uri: apiheader + '/image/getMenuIcon/' + item._id }} />
                                <View style={styles.menuItem}>
                                    <Text style={styles.menuName}>{item.menuName}</Text>
                                    <View style={styles.flexAddmenu}>
                                        <Text style={styles.price}>฿{item.price}</Text>
                                        <TouchableOpacity style={styles.Addmenu} onPress={() => handleSetAddon(item)}
                                            key={item._id}>
                                            <AntDesign name="plussquare" size={30} color="#FF914D" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
            <View style={styles.Summary}>
            <View style={styles.cartSummary}>
                <Text style={styles.cartTotal}>มีอยู่ {totalItems} รายการ</Text>
                <View style={styles.flexprice}>
                <Text style={styles.cartTotal1}>฿{totalPrice}</Text>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => navigation.navigate('reserve', { restaurantId: route.params.restaurantId })}
                >
                    <Text style={styles.confirmButtonText}>ดูรากาารอาหาร</Text>
                </TouchableOpacity>
                </View>
               
            </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)} // Close modal on hardware back press
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <MenuAddonScreen
                            route={{
                                params: {
                                    restaurantId: route.params.restaurantId,
                                    navigationSource: route.params.navigationSource,
                                    selectedMenuItem: selectedMenuItem,
                                    selectedTables: selectedTables,
                                }
                            }}
                            closeModal={() => handleclose()}
                            navigation={navigation}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 30,
        marginRight: 30


    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    Flextitlemenu: {
        flexDirection: 'row',
        marginTop: 10,

    },
    titlemenu: {
        marginLeft: 'auto'
    },
    menubox: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10
    },
    cardspace: {
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
        borderRadius: 10,
        backgroundColor: 'white'


    },
    card: {
        width: '100%',
        backgroundColor: 'white'

    },
    menuName: {
        fontSize: 18,
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        color: '#FF66AB',
        fontWeight: 'bold',
    },
    logo: {
        width: 155,
        height: 155,
        resizeMode: 'cover',
        borderRadius: 5,
        alignSelf: 'center'
    },
    flexAddmenu: {
        flexDirection: 'row',
    },
    Addmenu: {
        marginLeft: 'auto',
    },
    restaurantListContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
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
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF914D'
    },
    selectedTablesText: {

        fontSize: 18,
        fontWeight: 'bold'
    },
    cartSummary:{
        flexDirection:'row',
        marginTop:10,
        marginBottom:10,
    },
    confirmButton:{
        padding:10,
        backgroundColor:'#FF914D',
        marginLeft:'auto',
        borderRadius:10

    },
    confirmButtonText:{
        color:'white',
        fontSize:16
    },
    cartTotal:{
        fontSize:18,
        alignSelf:'center',
        color:'gray'
    },
    cartTotal1:{
        fontSize:18,
        alignSelf:'center',
        color:'#FF914D',
        marginRight:15
    },
    flexprice:{
        flexDirection:'row',
        marginLeft:'auto'
    },
    recommend:{
        fontSize:18,
        marginTop:15    
    }
});

export default MenuList;
