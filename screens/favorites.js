import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView } from 'react-native';
import Text from '../component/Text';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const FavoritesScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [imageUris, setImageUris] = useState({});

  const fetchRestaurants = async () => {

    try {
      const response = await axios.get(apiheader + '/restaurants/')
      const result = await response.data;
      setRestaurants(result);
    } catch (error) {
      console.error(error);
    }

  };
  const toggleFavorite = async (restaurantId) => {
    try {
      const userCredentials = await SecureStore.getItemAsync('userCredentials');
      const { username } = JSON.parse(userCredentials);
      const response = await axios.post(`${apiheader}/users/favorite`, {
        username,
        restaurantId
      });

      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites');
    }
  };
  const getUserDetail = async () => {
    const userCredentials = await SecureStore.getItemAsync('userCredentials');
    if (!userCredentials) return navigation.navigate('Login');
    const { username } = JSON.parse(userCredentials);
    try {
      const response = await axios.get(`${apiheader}/users/getusers/${username}`);
      const result = response.data;
      setFavorites(result.favorites || []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchRestaurants();
    getUserDetail();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchRestaurants();
      getUserDetail();
      return () => {
      };
    }, [])
  );
  useEffect(() => {
    if (!Array.isArray(restaurants)) return;
    const newImageUris = {};
    restaurants.forEach((restaurant) => {
      if (!imageUris[restaurant._id]) {
        newImageUris[restaurant._id] = `${apiheader}/image/getRestaurantIcon/${restaurant._id}?timestamp=${Date.now()}`;
      }
    });
    if (Object.keys(newImageUris).length > 0) {
      setImageUris((prevUris) => ({ ...prevUris, ...newImageUris }));
    }
  }, [restaurants]);
  return (
    <View style={styles.container}>
      {favorites.length > 0 && (
        <View style={styles.searchResContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Array.isArray(restaurants) && restaurants.length > 0 ? (
              restaurants
                .filter((restaurant) => favorites.includes(restaurant._id)) // Show only favorite restaurants
                .reduce((rows, item, index) => {
                  if (index % 2 === 0) rows.push([]);
                  rows[rows.length - 1].push(item);
                  return rows;
                }, [])
                .map((row, rowIndex) => (
                  <View style={styles.row} key={rowIndex}>
                    {row.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                      >
                        <View style={styles.card}>
                          <Image
                            style={styles.logo}
                            source={{ uri: imageUris[item._id] || "" }} // Ensure there's a valid URI
                          />

                          {/* Favorite Star Button */}
                          <TouchableOpacity onPress={() => toggleFavorite(item._id)} style={styles.favoriteIcon}>
                            <FontAwesome name="star" size={24} color="gold" />
                          </TouchableOpacity>

                          <View style={styles.text}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text>
                                {item.status == "closed" &&
                                  <Text style={{ color: 'red' }}>ปิด </Text>

                                }
                                <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                              </Text>
                            </View>
                            <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
            ) : (
              <View>
                <Text>{restaurants === undefined ? "กำลังโหลดข้อมูล!" : "ไม่มีร้านอาหารที่ถูกใจ"}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  }, searchResContainer: {
    marginRight: 15,
    marginLeft: 15,
  }, card: {
    width: 180,
    height: 230,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 0,
    borderRadius: 10,
    backgroundColor: 'white',
  }, logo: {
    width: '99%',
    height: '60%',
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'center'
  }, favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  }, text: {
    padding: 10,
    paddingBottom: 0,

  }, restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  }, restaurantDescription: {
    fontSize: 14,
    color: '  ',

  }, row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default FavoritesScreen;
