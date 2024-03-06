import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image'
import _ from 'lodash';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RestaurantDetailScreen = ({ route }) => {
  const [obj, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [phonenumber, setPhonenumber] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  
  function compareObjs(obj1,obj2){
    return JSON.stringify(obj1)===JSON.stringify(obj2);
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
    if (contains(selected,item)) {
      return (
        <TouchableOpacity onPress={() => removeSelected(item)}>
          <View style={styles.dragablecontent}>
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
          </View>
        </TouchableOpacity>

      )
    }else{
      return (
        <TouchableOpacity onPress={() => addSelected(item)}>
          <View style={styles.dragablecontent}>
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
          </View>
        </TouchableOpacity>

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
              <TableComponent item={item} key={index}/>
            ))}
          </View>
          <Text style={styles.help}>ความต้องการเพิ่มเติม</Text>
          <TextInput
            style={styles.input}
            value={phonenumber}
            onChangeText={text => setPhonenumber(text)}
          />

        </View>
      </ScrollView>
      <TouchableOpacity style={styles.reserveButton} >
        <Text style={styles.reserveButtonText}>ยืนยันการจอง</Text>
      </TouchableOpacity>
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    marginTop: 30,
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    paddingBottom: 50
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  help: {
    marginTop: 20
  },
  dragablecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 350,
    height: 450,
    alignSelf: 'center',
    marginVertical: 20,
    borderColor: 'black',
    borderWidth: 1
  },
  tablecontainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  }, dragablecontent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  }
});



export default RestaurantDetailScreen;
