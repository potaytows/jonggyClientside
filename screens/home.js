import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../component/Text';
import * as SecureStore from 'expo-secure-store';
import { Dimensions } from 'react-native';
import { useCallback } from 'react';
const screenWidth = Dimensions.get('window').width;
import { useFocusEffect } from '@react-navigation/native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const HomeScreen = ({ navigation }) => {
  const [imageUris, setImageUris] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRestaurants();
    await getUserDetail();
    setRefreshing(false);
  }, []);
  const fetchRestaurants = async () => {
    if (searchQuery) {
      try {
        const response = await axios.get(apiheader + '/restaurants/getlikeRestaurants/' + searchQuery)
        const result = await response.data;
        setRestaurants(result);
      } catch (error) {
        console.error(error);
      }

    } else {
      try {
        const response = await axios.get(apiheader + '/restaurants/')
        const result = await response.data;
        setRestaurants(result);
      } catch (error) {
        console.error(error);
      }
    }

  };
  const getUserDetail = async () => {
    const userCredentials = await SecureStore.getItemAsync('userCredentials');
    if (!userCredentials) return navigation.navigate('Login');

    const { username } = JSON.parse(userCredentials);
    try {
      const response = await axios.get(`${apiheader}/users/getusers/${username}`);
      const result = response.data;

      if (result?.isBanned) {
        await SecureStore.deleteItemAsync('userCredentials');
        navigation.navigate('Login');
      } else {
        setFavorites(result.favorites || []);
      }
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
  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery]);

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
  useEffect(() => {
    const interval = setInterval(() => {
      if (restaurants.length > 0) {
        setCurrentIndex((prevIndex) =>
          prevIndex === restaurants.length - 1 ? 0 : prevIndex + 1
        );
        scrollRef.current?.scrollTo({
          x: currentIndex * 400,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, restaurants]);

  return (
    <ScrollView refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.container}>
        <LinearGradient style={styles.header}
          colors={['#FB992C', '#EC7A45']} start={{ x: 0.2, y: 0.8 }}>
          <View style={styles.flexheader}>
            <Text style={styles.home}>JONGGY</Text>
            <TouchableOpacity style={styles.searchIcon} onPress={() => setIsSearchVisible(!isSearchVisible)}>
              <FontAwesome name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {isSearchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหาร้านอาหาร"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                }}
              />
            </View>
          )}
        </LinearGradient>
        {searchQuery === '' && (
          <Text style={styles.pmtsub}>โปรโมชั่นแนะนำ</Text>
        )}
        {searchQuery === '' && (

          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} style={{ width: '100%' }}>
            <TouchableOpacity style={styles.promotioncard}>
              <Image style={styles.promotions} source={require('../assets/images/pmtss1.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotioncard}>
              <Image style={styles.promotions} source={require('../assets/images/pms2.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotioncard}>
              <Image style={styles.promotions} source={require('../assets/images/pms3.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotioncard}>
              <Image style={styles.promotions} source={require('../assets/images/pms4.png')} />
            </TouchableOpacity>
          </ScrollView>

        )}
        {searchQuery === '' && favorites.length > 0 && (
          <Text style={styles.pmtsub}>ร้านโปรด</Text>
        )}

        {searchQuery == '' && favorites.length > 0 && (
          <View style={styles.searchResContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>

              {Array.isArray(restaurants) && restaurants.length > 0 ? (
                restaurants
                  .filter((restaurant) => favorites.includes(restaurant._id)) // Show only favorite restaurants
                  .map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    >
                      <View style={styles.card}>
                        <Image
                          key={item._id}
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
                            {item.status == "closed"&& 
                            <Text style={{ color: 'red' }}>ปิด </Text>
                            
                            }
                            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                          </Text>
                        </View>
                          <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View>
                  <Text>{restaurants === undefined ? "กำลังโหลดข้อมูล!" : "ไม่มีร้านอาหารที่ถูกใจ"}</Text>
                </View>
              )}
            </ScrollView>

          </View>

        )}

        {searchQuery === '' && (
          <Text style={styles.pmtsub}>ร้านอาหารแนะนำ</Text>
        )}

        {searchQuery != '' && (
          <ScrollView>
            <View style={styles.searchResContainer}>
              {Array.isArray(restaurants) ? (
                restaurants.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    key={item._id}
                  >
                    <View style={styles.card}>
                      <Image
                        key={item._id}
                        style={styles.logo}
                        source={{ uri: imageUris[item._id] || "" }}
                      />
                      <TouchableOpacity onPress={() => toggleFavorite(item._id)} style={styles.favoriteIcon}>
                        <FontAwesome name={favorites.includes(item._id) ? "star" : "star-o"} size={24} color="gold" />
                      </TouchableOpacity>

                      <View style={styles.text}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text>
                            {item.status == "closed"&& 
                            <Text style={{ color: 'red' }}>ปิด </Text>
                            
                            }
                            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                          </Text>
                        </View>

                        <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View><Text>กำลังโหลดข้อมูล!</Text></View>
              )}

            </View>
          </ScrollView>
        )}

        {searchQuery === '' && (

          <ScrollView horizontal showsHorizontalScrollIndicator={false} >
            <View style={styles.restaurantListContainer}>
              {Array.isArray(restaurants) ? (
                restaurants
                  .filter((item) => item.status === "open") // Only show restaurants with "open" status
                  .map((item, index) => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                      key={item._id}
                    >
                      <View style={styles.card}>
                        <Image
                          key={item._id}
                          style={styles.logo}
                          source={{ uri: imageUris[item._id] || "" }}
                        />
                        <TouchableOpacity onPress={() => toggleFavorite(item._id)} style={styles.favoriteIcon}>
                          <FontAwesome name={favorites.includes(item._id) ? "star" : "star-o"} size={24} color="gold" />
                        </TouchableOpacity>

                        <View style={styles.text}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text>
                            {item.status == "closed"&& 
                            <Text style={{ color: 'red' }}>ปิด </Text>
                            
                            }
                            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                          </Text>
                        </View>
                          <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View><Text>กำลังโหลดข้อมูล!</Text></View>
              )}
            </View>
          </ScrollView>

        )}

        {searchQuery === '' && (
          <Text style={styles.pmtsub}>ร้านอาหารโปรโมชั่น</Text>
        )}
        {searchQuery === '' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} >
            <View style={styles.restaurantListContainer}>
              {Array.isArray(restaurants) ? (
                restaurants
                  .filter((item) => item.status === "open") // Only show restaurants with "open" status
                  .map((item, index) => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                      key={item._id}
                    >
                      <View style={styles.card}>
                        <Image
                          key={item._id}
                          style={styles.logo}
                          source={{ uri: imageUris[item._id] || "" }}
                        />
                        <TouchableOpacity onPress={() => toggleFavorite(item._id)} style={styles.favoriteIcon}>
                          <FontAwesome name={favorites.includes(item._id) ? "star" : "star-o"} size={24} color="gold" />
                        </TouchableOpacity>

                        <View style={styles.text}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text>
                            {item.status == "closed"&& 
                            <Text style={{ color: 'red' }}>ปิด </Text>
                            
                            }
                            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                          </Text>
                        </View>
                          <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View><Text>กำลังโหลดข้อมูล!</Text></View>
              )}

            </View>
          </ScrollView>
        )}
        {searchQuery === '' && (
          <ScrollView>
            <View style={styles.underhResContainer}>
              {Array.isArray(restaurants) ? (
                restaurants
                  .filter((item) => item.status === "open") // Only show restaurants with "open" status
                  .map((item) => (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('RestaurantDetail', {
                          restaurantId: item._id,
                          restaurantName: item.restaurantName,
                        })
                      }
                      key={item._id}
                    >
                      <View style={styles.searchcard}>
                        <Image
                          key={item._id}
                          style={styles.searchlogo}
                          source={{ uri: imageUris[item._id] || "" }}
                        />
                        <View style={styles.searchtext}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text>
                            {item.status == "closed"&& 
                            <Text style={{ color: 'red' }}>ปิด </Text>
                            
                            }
                            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                          </Text>
                        </View>
                          <Text style={styles.restaurantDescription}>{item.description}</Text>
                        </View>

                        {/* Star Icon for Favorite */}
                        <TouchableOpacity onPress={() => toggleFavorite(item._id)}>
                          <FontAwesome
                            name={favorites.includes(item._id) ? 'star' : 'star-o'}
                            size={24}
                            color="gold"
                            style={{ marginLeft: 'auto', padding: 10 }}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View>
                  <Text>กำลังโหลดข้อมูล!</Text>
                </View>
              )}


            </View>
          </ScrollView>
        )}


        {restaurants.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>ไม่พบร้านอาหาร</Text>
          </View>
        )}
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"white"
    
  },
  header: {
    width: '100%',
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10

  },
  flexheader: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  home: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchIcon: {
    marginLeft: 'auto',
    alignSelf: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20

  },
  underhResContainer: {
    marginLeft: 15,
    marginRight: 30
  },

  searchResContainer: {
    marginRight: 15,
    marginLeft: 15,
  },
  searchcard: {
    borderBottomWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    marginTop: 15,
    paddingBottom: 15

  },
  searchlogo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  searchtext: {
    flex: 1,
    marginLeft: '3%',

  },
  searchrestaurantName: {
    fontSize: 16
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingLeft: 10,
    flex: 1,
    marginRight: 5,
  }

  , restaurantListContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  card: {
    width: 180,
    height: 230,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 0,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  text: {
    padding: 10,
    paddingBottom: 0,

  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '  ',

  },
  distant: {
    marginLeft: 'auto',
    marginTop: 10,
    color: 'gray',
  },
  logo: {
    width: '99%',
    height: '60%',
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'center'
  },
  boxPMS: {
    borderRadius: 20,

  },
  promotioncard: {
    width: screenWidth * 0.9,
    height: 200,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotions: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  pmtsub: {
    alignSelf: 'flex-start',
    fontSize: 20,
    marginTop: 15,
    marginLeft: 20
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
  }, favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});

export default HomeScreen;
