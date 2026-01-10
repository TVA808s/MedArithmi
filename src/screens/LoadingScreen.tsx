import React from 'react';
import { useNavigation } from "@react-navigation/native";
import { Button, View, StyleSheet, Text } from "react-native";
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import {AnimatedCircleSpinner}  from '../components/AnimatedSpinner';

// необходима типизация переменной navigation
type LoadingScreenNavigationProp = StackNavigationProp<ScreensList, 'Loading'>;

export function LoadingScreen() {
    const navigation = useNavigation<LoadingScreenNavigationProp>();
    
    const handleMain = () => {
        navigation.navigate('Main');
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Загрузка...</Text>
            <AnimatedCircleSpinner/>
            <Button title="Перейти на главную" onPress={handleMain} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    text: {
        fontFamily: 'Jaldi-Bald',
        marginTop: 30,
        marginBottom: 20,
        fontSize: 18,
        color: '#333',
    }
});
