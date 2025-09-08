import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppProvider';


export default function Login() {
const [name, setName] = useState('Cris');
const { login } = useApp();
const router = useRouter();


const onSubmit = () => { login(name.trim()||'Invitado'); router.replace('(tabs)'); };


return (
<View className="flex-1 items-center justify-center px-6 bg-white">
<Text className="text-2xl font-bold mb-4">Mini‑ClickUp</Text>
<TextInput
value={name}
onChangeText={setName}
placeholder="Tu nombre"
className="w-full border rounded-xl px-4 py-3 mb-3"
/>
<TouchableOpacity onPress={onSubmit} className="bg-black px-4 py-3 rounded-xl w-full">
<Text className="text-white text-center font-semibold">Entrar</Text>
</TouchableOpacity>
</View>
);
}