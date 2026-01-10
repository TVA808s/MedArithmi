import { useNavigation } from "@react-navigation/native";
import { Button, Text } from "react-native";
import { View } from "react-native";
import type { StackNavigationProp } from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';

// необходима типизация переменной navigation
type MainScreenNavigationProp = StackNavigationProp<ScreensList, 'Loading'>;

export function  MainScreen() {
    const navigation = useNavigation<MainScreenNavigationProp>();
    const handleCalculator = () => {
        navigation.navigate('Calculator');
    };
    const handleHistory = () => {
        navigation.navigate('History');
    };
    const handleSettings = () => {
        navigation.navigate('Settings');
    };
    return (
        <View>
            <Button title="Calculator" onPress={handleCalculator}/>
            <Button title="History" onPress={handleHistory}/>
            <Button title="Settings" onPress={handleSettings}/>
        </View>
    );
}
