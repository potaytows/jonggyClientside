import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../component/Text';
import * as SecureStore from 'expo-secure-store';


const apiheader = process.env.EXPO_PUBLIC_apiURI;
const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const { username } = JSON.parse(userCredentials);
    try {
      const response = await axios.get(apiheader + '/users/getusers/' + username)
      const result = await response.data;
      if (result?.isBanned== true) {
        await SecureStore.deleteItemAsync('userCredentials');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
    }


  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery]);

  useEffect(() => {
    fetchRestaurants();
    getUserDetail();

  }, []);

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
    <ScrollView>
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef}>
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

        {searchQuery === '' && (
          <Text style={styles.pmtsub}>ร้านอาหารแนะนำ</Text>
        )}

        {searchQuery != '' && (
          <ScrollView>
            <View style={styles.searchResContainer}>
              {restaurants !== undefined ? (
                restaurants.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    key={item._id}
                  >
                    <View style={styles.searchcard}>
                      <Image style={styles.searchlogo} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item._id }} />
                      <View style={styles.searchtext}>
                        <Text style={styles.searchrestaurantName}>{item.restaurantName}</Text>
                        <Text style={styles.restaurantDescription}>{item.description}</Text>
                        <Text style={styles.searchdistant}>ระยะทาง</Text>
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.restaurantListContainer}>
              {restaurants !== undefined ? (
                restaurants.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    key={item._id}
                  >
                    <View style={styles.card}>
                      <Image style={styles.logo} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item._id }} />
                      <View style={styles.text}>
                        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                        <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                        <Text style={styles.distant}>ระยะทาง km</Text>
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
              {restaurants !== undefined ? (
                restaurants.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    key={item._id}
                  >
                    <View style={styles.card}>
                      <Image style={styles.logo} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item._id }} />
                      <View style={styles.text}>
                        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                        <Text numberOfLines={1} style={styles.restaurantDescription}>{item.description}</Text>
                        <Text style={styles.distant}>ระยะทาง km</Text>
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
              {restaurants !== undefined ? (
                restaurants.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id, restaurantName: item.restaurantName })}
                    key={item._id}
                  >
                    <View style={styles.searchcard}>
                      <Image style={styles.searchlogo} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item._id }} />
                      <View style={styles.searchtext}>
                        <Text style={styles.searchrestaurantName}>{item.restaurantName}</Text>
                        <Text style={styles.restaurantDescription}>{item.description}</Text>
                        <Text style={styles.searchdistant}>ระยะทาง km</Text>
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
    marginLeft: 30,
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
    margin: 10,
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
    color: 'gray',
    
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
    width: 400,
    height: 200,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  promotions: {
    width: '100%',
    height: 200,
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
  },
});

export default HomeScreen;
