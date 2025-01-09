import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from './Text';

const table = ({ item, selected,setSelected}) => {
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
    }
    const removeSelected = (val) => {
        setSelected((old) => old.filter((tables) => tables !== val))

    }

    const styles = StyleSheet.create({
        container: {
            left: item.x,
            top: item.y,    
            position: 'absolute'
        },
        text: {
            color: 'black',
            textAlign:'center'
        },
        image: {
            height: 30, 
            width: 30
        }, shape: {
            backgroundColor: "orange",
            position: 'absolute'
            
        }
    });


    if (item.type == "table") {
        if (item.status == "enabled") {
            if(contains(selected,item)){
                return (
                    <TouchableOpacity onPress={() => {
                        removeSelected(item)
    
                    }} style={[styles.container, { zIndex: 100 }]} activeOpacity={1}>
                        <Image
                            source={require('../assets/images/table.png')}
                            borderRadius={5}
                            style={styles.image}
                            tintColor={'#C3F9C9'}
                        />
                        <Text style={styles.text}>{item.text}</Text>
                    </TouchableOpacity>
                );

            }else{
                return (
                    <TouchableOpacity onPress={() => {
                        addSelected(item)
    
                    }} style={[styles.container, { zIndex: 100 }]} activeOpacity={1}>
                        <Image
                            source={require('../assets/images/table.png')}
                            borderRadius={5}
                            style={styles.image}
                        />
                        <Text style={styles.text}>{item.text}</Text>
                    </TouchableOpacity>
                );
                

            }
           

        }
        if (item.status == "disabled") {
            return (
                <TouchableOpacity onPress={() => {
                }} style={[styles.container, { zIndex: 100 }]} activeOpacity={1}>
                    <Image
                        source={require('../assets/images/table.png')}
                        borderRadius={5}
                        style={styles.image}
                        tintColor={"gray"}
                    />
                    <Text style={styles.text}>{item.text}</Text>
                </TouchableOpacity>
            );

        }


    }
    if (item.type == "text") {
        return (
            <View style={[styles.container, { zIndex: 100 }]}>
                <Text style={styles.text}>{item.text}</Text>
            </View>
        );

    }
    // ? backgroundColor:item.color:{}
    if (item.type == "shape") {
        return (
            <View style={[styles.shape, { left: item.x, top: item.y, height: item.height, width: item.width, backgroundColor: item.color, zIndex: -20 }]}>

            </View>
        );

    }

};





export default table;