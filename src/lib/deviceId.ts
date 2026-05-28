import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@tbilisi_report_device_id';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = generateId();
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}
