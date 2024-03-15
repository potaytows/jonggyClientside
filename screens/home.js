import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView } from 'react-native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const HomeScreen = ({navigation}) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchRestaurants = async () => {
    if(searchQuery){
      try {
        const response = await axios.get(apiheader + '/restaurants/getlikeRestaurants/'+searchQuery)
        const result = await response.data;
        setRestaurants(result);
      } catch (error) {
        console.error(error);
      }

    }else{
      try {
        const response = await axios.get(apiheader + '/restaurants/')
        const result = await response.data;
        setRestaurants(result);
        console.log(typeof restaurants)
      } catch (error) {
        console.error(error);
      }
    }

  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.home}>HOME</Text>
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
        </View>
        {searchQuery === '' && (
          <TouchableOpacity style={styles.promotioncard}>
            <Image style={styles.promotions} source={require('../assets/images/pmtss1.png')} />
            <Text style={styles.pmtsub}>ร้านค้าและโปรโมชั่นแนะนำ</Text>
          </TouchableOpacity>

        )}

        <View style={styles.restaurantListContainer}>
          {/* <FlatList
            data={restaurants}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={renderRestaurantItem}
          /> */}
          {/* unavailable cause' flatlist cant be nested inside scrollview  */}
          
          
          {restaurants != undefined ? restaurants.map((item, index) => (
              <TouchableOpacity
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id ,restaurantName:item.restaurantName})}
        key={item._id}
            >
              <View style={styles.card}>
                <Image style={styles.logo} source={{ uri: apiheader + '/image/getRestaurantIcon/' + item._id }}  />
                <View style={styles.text} >
                  <Text style={styles.restaurantName} > {item.restaurantName}</Text>
                  <Text style={styles.restaurantDescription}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>

            )

          ):<View><Text>กำลังโหลดข้อมูล!</Text></View>}


        </View>

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
    alignItems: 'center',
    
  },
  header: {
    width: '100%',
    backgroundColor: '#FF914D',
    paddingVertical: 10,
    marginBottom: 10,
  },
  home: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: '5%',
    marginLeft: '5%',

  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingLeft: 10,
    flex: 1,
    marginRight: 5,
  }
  // ,cardContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   justifyContent: 'space-between',
  //   paddingHorizontal: 16,
  // }
  ,restaurantListContainer:{
    flex:1,
    flexDirection:'row',
    flexWrap: 'wrap',
    alignContent:'center',
    justifyContent:'center'



  },
  // restaurantItemContainer: {
  //   flex: 1,
  //   width:100,
  //   height:400,
  //   backgroundColor:'orange'
  // },
  card: {
    width:180,
    height:250,

  },
  text: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: 'pink',
    alignSelf:'center'
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
    alignSelf:'center'
  },
  promotioncard: {
    width: '100%',
    alignItems: 'center',
  },
  promotions: {
    width: '88%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
    marginBottom: 8,

  },
  pmtsub: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#209BCF'
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
