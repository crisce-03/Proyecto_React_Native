import { View, Text, TouchableOpacity } from 'react-native';


export default function TaskCard({ task, onPress }) {
return (
<TouchableOpacity onPress={onPress} className="border rounded-xl p-3 mb-2">
<Text className="font-semibold">{task.title}</Text>
<Text className="text-xs opacity-70">ID: {task.id.slice(-6)} · Estado: {task.state}</Text>
</TouchableOpacity>
);
}