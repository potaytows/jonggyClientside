import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, AsyncStorage, Alert,Toast } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Text from '../component/Text';

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameNotFound, setUsernameNotFound] = useState(false);
    const [passwordNotFound, setPasswordNotFound] = useState(false);



    const handleRegisterPress = () => {
        navigation.navigate('Register');
    };
    const handleForgotPassword = () => {
        navigation.navigate('forgotPassword');
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }
        const credentials = {
            username: username,
            password: password,
        };

        try {

            const response = await axios.post(apiheader + '/users/auth', credentials);
            if (response.data.status == "auth success") {
                const res = await response.data
                await SecureStore.setItemAsync('userCredentials', JSON.stringify(res.obj));
                setTimeout(() => {
                    navigation.navigate('tab');
                }, 200);
            } else {
                setUsernameNotFound(true);
                setPasswordNotFound(true);
            }
        } catch (error) {
            console.log(error);
            setUsernameNotFound(true);
            setPasswordNotFound(true);
        }
    };



    return (
        <View style={styles.container}>
            <Image style={styles.Logo}
                source={require('../assets/images/Jonggylogo.png')}
            />
            <View style={styles.container2} >
                <TextInput
                    placeholder='ชื่อผู้ใช้'
                    placeholderTextColor='gray'
                    style={[styles.input, usernameNotFound && styles.inputError]}
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        setUsernameNotFound(false);
                    }}
                />
                <TextInput
                    placeholder='รหัสผ่าน'
                    placeholderTextColor='gray'
                    style={[styles.input, passwordNotFound && styles.inputError]}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordNotFound(false);
                    }}
                    secureTextEntry
                />
                {usernameNotFound && passwordNotFound && <Text style={styles.errorText}>ไม่พบชื่อผู้ใช้ดังกล่าว</Text>}
                

                <TouchableOpacity style={styles.buttonwellcome} onPress={handleForgotPassword}>
                    <Text style={styles.textbutton}>ลืมรหัสผ่าน</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleLogin} >
                    <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonwellcome} onPress={handleRegisterPress}>
                    <Text style={styles.textbutton}>สมัครสมาชิก</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2F2F2F',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container2: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        color: 'white',
        backgroundColor: '#FF313180',
        borderColor: '#FF3131',
        borderRadius: 5,
        width: '80%',
        padding: 10,
        marginBottom: 10,
        alignSelf: 'center',
        marginTop: 10
    },
    button: {
        backgroundColor: '#FF914D',
        width: '40%',
        padding: 10,
        marginTop: 20,
        alignSelf: 'center',
        borderRadius: 5
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonwellcome: {
        marginTop: 20,
        alignItems: 'center',
    },
    textbutton: {
        color: '#FF3131',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    Logo: {
        width: 200,
        height: 200
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: '#FF914D',
        textAlign: 'center',
    },
});

export default LoginScreen;
