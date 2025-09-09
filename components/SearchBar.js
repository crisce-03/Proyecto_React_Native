import { View, TextInput } from 'react-native';
export default function SearchBar({ value, onChange }) {
return (
<View className="border rounded-xl px-3 py-2 mb-3 text-lg">
<TextInput className="text-lg" value={value} onChangeText={onChange} placeholder="Buscar por título o ID..." />
</View>
);
}