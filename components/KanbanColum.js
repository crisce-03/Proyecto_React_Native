import { View, Text } from 'react-native';
import TaskCard from './TaskCard';


export default function KanbanColumn({ title, tasks, onOpen }) {
return (
<View className="w-64 mr-4">
<Text className="font-bold mb-2">{title}</Text>
<View>
{tasks.map(t=> <TaskCard key={t.id} task={t} onPress={()=>onOpen(t)} />)}
</View>
</View>
);
}