import AsyncStorage from '@react-native-async-storage/async-storage';


const KEY = 'mini_clickup_state_v1';


export async function saveState(state) {
try { await AsyncStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}


export async function loadState() {
try {
const raw = await AsyncStorage.getItem(KEY);
return raw ? JSON.parse(raw) : null;
} catch {
return null;
}
}


export async function clearState() {
try { await AsyncStorage.removeItem(KEY); } catch {}
}