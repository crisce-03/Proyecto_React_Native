import '../global.css';
import { Stack } from 'expo-router';
import { AppProvider, useApp } from '../contexts/AppProvider';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



function Gate({ children }) {
const { ready } = useApp();
if (!ready) return null; // splash por simplicidad
return children;
}


export default function Layout() {
return (
<GestureHandlerRootView style={{ flex: 1 }}>
<AppProvider>
<Gate>
<Stack screenOptions={{ headerShown: false }} />
</Gate>
</AppProvider>
</GestureHandlerRootView>
);
}