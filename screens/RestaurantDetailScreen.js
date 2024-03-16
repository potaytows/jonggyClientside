import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image'
import _ from 'lodash';
import * as SecureStore from 'expo-secure-store';



const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RestaurantDetailScreen = ({ route, navigation }) => {
  const [obj, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [request, setRequest] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
 
  


  const checkLoginStatus = async () => {
    try {
      const userCredentials = await SecureStore.getItemAsync('userCredentials');

      if (userCredentials) {
        setIsLoggedIn(true);
        const user = JSON.parse(userCredentials);
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handlecomplete = () => {
    if (!isLoggedIn) {
      navigation.navigate('profile');
    } else {
      navigation.navigate('reserve', {
        restaurantId: route.params.restaurantId,
        restaurantName: restaurantDetails.restaurantName,
        selectedTables: selected,

        
      });
      console.log(restaurantDetails)
    }
  };

  function compareObjs(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  const contains = (arr, val) => {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        return true;
      }
    }

    return false;

  }
  const addSelected = (val) => {
    setSelected((old) => [...old, val])
    // ToastAndroid.showWithGravityAndOffset('Selected ' + val.tableName, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50)
  }
  const removeSelected = (val) => {
    setSelected((old) => old.filter((tables) => tables !== val))
    // ToastAndroid.showWithGravityAndOffset('Deselected ' + val.tableName, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50)

  }

  const getTables = async () => {
    try {
      const response = await axios.get(apiheader + '/tables/getbyRestaurantId/' + route.params.restaurantId);
      const result = await response.data;
      setData(result)
    } catch (error) {
      console.error(error);
    }
  };
  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(apiheader + '/restaurants/' + route.params.restaurantId);
      const result = await response.data;
      setRestaurantDetails(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    getTables();
    fetchRestaurantDetails();
  }, []);
  if (!restaurantDetails) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const TableComponent = (props) => {
    const item = props.item
    if (contains(selected, item)) {
      return (
        <View style={styles.dragablecontent}>

        <TouchableOpacity onPress={() => removeSelected(item)} style={styles.dragable}>
            <View style={{ left: item.x, top: item.y }}>
              <View style={[styles.tablecontainer]}>
                <AutoHeightImage
                  width={30}
                  height={30}
                  source={require('../assets/images/table.png')}
                  borderRadius={5}
                  tintColor={"gray"}

                />

                <Text style={styles.text}>{item.tableName}</Text>
              </View>
            </View>
        </TouchableOpacity>
        </View>

      )
    } else {
      return (
        <View style={styles.dragablecontent}>

        <TouchableOpacity onPress={() => addSelected(item)}>
            <View style={{ left: item.x, top: item.y }}>
              <View style={[styles.tablecontainer]}>
                <AutoHeightImage
                  width={30}
                  height={30}
                  source={require('../assets/images/table.png')}
                  borderRadius={5}
                />

                <Text style={styles.text}>{item.tableName}</Text>
              </View>
            </View>
        </TouchableOpacity>
        </View>


      )

    }



  }

  return (
    <View>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.restaurantContainer}>
            <Image style={styles.logoRes} source={{ uri: apiheader + '/image/getRestaurantIcon/' + restaurantDetails._id }} />
            <Text style={styles.restaurantName}>{restaurantDetails.restaurantName}</Text>

          </View>
          <View style={styles.dragablecontainer}>
            {obj.map((item, index) => (
              <TableComponent item={item} key={index} />
            ))}
          </View>
          <View style={styles.requestContainer} >
            <Text style={styles.help}>ความต้องการเพิ่มเติม</Text>
            <TextInput
              style={styles.input}
              value={request}
              onChangeText={text => setRequest(text)}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.viewshow} >
        <Text style={styles.showtable}>
          โต๊ะที่เลือก: {selected.map((item, index) => (
            index == selected.length - 1 ? (
              <Text key={index} >{item.tableName}</Text>
            ) : (<Text key={index} >{item.tableName}, </Text>)

          ))}
        </Text>

        <TouchableOpacity style={styles.reserveButton} onPress={handlecomplete} >
          <Text style={styles.reserveButtonText}>ยืนยันการจอง</Text>
        </TouchableOpacity>
      </View>
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    flexDirection: 'column',
    paddingBottom: 50
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 20,

    marginTop: 30,
  },
  requestContainer: {
    marginLeft: 20,

  },
  logoRes: {
    width: 80,
    height: 120,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  restaurantName: {
    marginLeft: 10,
    marginTop: 5,
  },
  reserveButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF914D',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  reserveButtonText: {
    color: '#fff',
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '70%',
    marginBottom: '20%'
  },
  help: {
    marginTop: 20
  },
  dragablecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: 450,
    alignSelf: 'center',
    marginVertical: 20,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,

  },
  tablecontainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragablecontent: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center'

  },
  viewshow: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    height: '15%',
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6'
  },
  showtable: {
    marginTop: 15,
    marginLeft: 10
  },
  
});



export default RestaurantDetailScreen;
