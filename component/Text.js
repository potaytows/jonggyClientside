import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';  
import { useFonts } from 'expo-font';

const TextComponent =  props => {
    const style = props.style !=undefined ? props.style : {}

    return (
        <Text style={[style,{fontFamily:'Kanit-Regular',}]}>{props.children}</Text>
    );
};



export default TextComponent;
