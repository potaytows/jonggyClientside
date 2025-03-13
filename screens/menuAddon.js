import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import * as SecureStore from 'expo-secure-store';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuAddonScreen = ({ route, navigation, closeModal }) => {
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    const [addons, setAddons] = useState([]);
    const [checkedItems, setCheckedItems] = useState(Array(addons.length).fill(false));
    const [quantity, setQuantity] = useState(1);

    const fetchAddons = async () => {
        try {
            const response = await axios.get(`${apiheader}/addons/getAddOnByMenuID/${selectedMenuItem._id}`);
            const result = await response.data;
            setAddons(result);
            setCheckedItems(Array(result.length).fill(false));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setSelectedMenuItem(route.params.selectedMenuItem);
        setSelectedTables(route.params.selectedTables || []);
    }, [route.params.selectedMenuItem, route.params.selectedTables]);


    useFocusEffect(
        React.useCallback(() => {
            if (selectedMenuItem) {
                fetchAddons();

            }
        }, [selectedMenuItem])
    );

    const handleCheckboxChange = (index) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    const handleAddCart = async () => {
        const selectedAddons = addons.filter((addon, index) => checkedItems[index]);
        const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
        const username = login.username
        const cartData = {
            restaurantId: route.params.restaurantId,
            selectedTables: selectedTables.map(table => ({ _id: table._id, text: table.text })),
            selectedMenuItem: {
                _id: selectedMenuItem._id,
                menuName: selectedMenuItem.menuName,
                price: selectedMenuItem.price,
            },
            selectedAddons: selectedAddons.map(addon => ({ _id: addon._id, AddOnName: addon.AddOnName, price: addon.price* quantity })),
            OrderTableType: route.params.navigationSource,
            username: username,
            Count: quantity ,
            startTime:route.params.startTime,
            endTime:route.params.endTime
        };


        try {
            await axios.post(apiheader + '/cart/addToCart', cartData);
            closeModal(); // Close modal after adding to cart
            console.log('Cart data added successfully!');
            return 0; // Success code
            
        } catch (error) {
            console.error('Error adding cart data: ', error);
        }
        console.log(route.params.startTime)
        navigation.navigate('reserve',
            {
                restaurantId: route.params.restaurantId,
                navigationSource: route.params.navigationSource,
                selectedTables: selectedTables,
                startTime:route.params.startTime,
                endTime:route.params.endTime
            });
    };

    const calculateTotalPrice = () => {
        const addonTotal = addons.reduce((total, addon, index) => {
            return total + (checkedItems[index] ? addon.price : 0);
        }, 0);
        return (selectedMenuItem.price * quantity) + addonTotal* quantity;
    };




    return (
        <View style={styles.modalContent}>
            <Text style={styles.titleAddmenu} > เพิ่มรายการใหม่</Text>
            {selectedMenuItem && (
                <View>
                    <View style={styles.modalHeader}>
                        <Image style={styles.menuImage} source={{ uri: apiheader + '/image/getMenuIcon/' + selectedMenuItem._id }} />
                        <Text style={styles.menuTitle}>{selectedMenuItem.menuName}</Text>
                        <AntDesign name="close" size={24} onPress={closeModal} style={styles.closeIcon} />
                    </View>
                    {quantity && (
                        <Text style={styles.menuPrice}>฿{calculateTotalPrice()}</Text>
                    )}
                </View>
            )}
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <AntDesign name="minussquareo" size={24} color="#FF914D" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                    <AntDesign name="plussquare" size={24} color="#FF914D" />

                </TouchableOpacity>
            </View>

            {(addons[0] &&
                <Text style={styles.addonsText}>เพิ่มเติม</Text>
            )}
            <ScrollView>
                {addons.map((addon, index) => (
                    <View key={addon._id} style={styles.addonItem}>
                        <View style={styles.addonCheckbox}>
                            <Checkbox
                                value={checkedItems[index]}
                                onValueChange={() => handleCheckboxChange(index)}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                color='#FF914D'

                            />
                            <Text style={styles.addonNames} >{addon.AddOnName}</Text>
                        </View>
                        <Text style={styles.addonPrice}>+฿{addon.price}</Text>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddCart}>
                <Text style={styles.buttonText}>เพิ่มไปยังตะกร้าอาหาร</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    titleAddmenu: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold'
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    menuTitle: {
        fontSize: 18,
        marginLeft: 10,
    },
    closeIcon: {
        marginLeft: 'auto',
        color: 'gray',
    },
    menuPrice: {
        fontSize: 18,
        color: '#FF914D',
        marginVertical: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 10,
    },
    addonsText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    addonItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    addonCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addonPrice: {
        color: '#FF914D',
    },
    addToCartButton: {
        backgroundColor: '#FF914D',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    addonNames: {
        marginLeft: 10
    }
});

export default MenuAddonScreen;