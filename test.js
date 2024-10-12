import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuAddonScreen = ({ route, closeModal, navigation }) => {
    const [addons, setAddons] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [quantity, setQuantity] = useState(1); // To handle quantity
    

    const selectedMenuItem = route.params.selectedMenuItem;

    const fetchAddons = async () => {
        try {
            const response = await axios.get(`${apiheader}/addons/getAddOnByMenuID/${selectedMenuItem._id}`);
            const result = response.data;
            setAddons(result);
            setCheckedItems(Array(result.length).fill(false));
            return 0; // Success code
        } catch (error) {
            console.error(error);
            return 1; // Error code
        }
    };

    useEffect(() => {
        if (selectedMenuItem) {
            fetchAddons();
        }
    }, [selectedMenuItem]);

    const handleCheckboxChange = (index) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    const handleAddCart = async () => {
        const selectedAddons = addons.filter((addon, index) => checkedItems[index]);
        const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
        const username = login.username;

        const cartData = {
            restaurantId: route.params.restaurantId,
            selectedTables: route.params.selectedTables,
            selectedMenuItem: {
                _id: selectedMenuItem._id,
                menuName: selectedMenuItem.menuName,
                price: selectedMenuItem.price,
            },
            selectedAddons: selectedAddons.map(addon => ({ _id: addon._id, AddOnName: addon.AddOnName, price: addon.price })),
            username: username,
            Count: quantity,
        };

        try {
            await axios.post(apiheader + '/cart/addToCart', cartData);
            closeModal(); // Close modal after adding to cart
            return 0; // Success code
        } catch (error) {
            console.error('Error adding cart data: ', error);
            return 1; // Error code
        }
    };

    return (
        <View style={styles.modalContent}>
            <Text style={styles.titleAddmenu} > เพิ่มรายการใหม่</Text>
            <View style={styles.modalHeader}>
                <Image style={styles.menuImage} source={{ uri: `${apiheader}/image/getMenuIcon/${selectedMenuItem._id}` }} />
                <Text style={styles.menuTitle}>{selectedMenuItem.menuName}</Text>
                <AntDesign name="close" size={24} onPress={closeModal} style={styles.closeIcon} />
            </View>
            <Text style={styles.menuPrice}>฿{selectedMenuItem.price}</Text>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <AntDesign name="minussquareo" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                    <AntDesign name="plussquare" size={24} color="black" />

                </TouchableOpacity>
            </View>

            <Text style={styles.addonsText}>เพิ่มเติม</Text>
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
