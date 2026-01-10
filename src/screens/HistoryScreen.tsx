import { useNavigation } from "@react-navigation/native";
import { Button, Text } from "react-native";
import { View } from "react-native";
import type { StackNavigationProp } from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';

// необходима типизация переменной navigation
type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'Loading'>;

export function HistoryScreen() {
    const navigation = useNavigation<HistoryScreenNavigationProp>();
    const handleMain = () => {
        navigation.navigate('Main');
    };
    
    return (
        <View>
            <Button title="Main" onPress={handleMain}/>
        </View>
    );
}
