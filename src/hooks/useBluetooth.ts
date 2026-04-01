import { useState, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid, Permission } from 'react-native';
import BluetoothClassic from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';

export type Device = { id: string; name?: string; paired?: boolean };

export function useBluetooth() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ].filter(Boolean) as Permission[];
    const result = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(result).every(res => res === PermissionsAndroid.RESULTS.GRANTED);
  };

  const scanForDevices = async () => {
    setScanning(true);
    try {
      if (await requestPermissions()) {
        if (!(await BluetoothClassic.isBluetoothEnabled())) await BluetoothClassic.requestBluetoothEnabled();
        const paired = await BluetoothClassic.getBondedDevices();
        setDevices(paired.map(d => ({ id: d.address, name: d.name, paired: true })));
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao escanear");
    } finally {
      setScanning(false);
    }
  };

  const toggleConnection = async (device: Device) => {
    try {
      if (connectedDevice?.id === device.id) {
        await BluetoothClassic.disconnectFromDevice(device.id);
        setConnectedDevice(null);
      } else {
        await BluetoothClassic.connectToDevice(device.id);
        setConnectedDevice(device);
      }
    } catch (e) {
      Alert.alert("Conexão", "Falha ao conectar");
    }
  };

  const sendData = useCallback((speed: number, steering: number) => {
  if (!connectedDevice) return;

  // O firmware espera int16 big-endian. 
  // Como o slider agora vai de -255 a 255, usamos o valor arredondado diretamente.
  const speedRaw = Math.round(speed); 
  
  // Converte para 16 bits (mantendo o sinal para números negativos)
  const unsigned = speedRaw & 0xffff;
  
  // payload[0] = Byte mais significativo (MSB)
  // payload[1] = Byte menos significativo (LSB)
  // payload[2] = Direção (1 byte)
  const payload = Uint8Array.from([
    (unsigned >> 8) & 0xff, 
    unsigned & 0xff, 
    Math.round(steering)
  ]);

  BluetoothClassic.writeToDevice(
    connectedDevice.id, 
    Buffer.from(payload).toString('base64'), 
    'base64'
  ).catch(() => {});
}, [connectedDevice]);

  return {
    devices,
    connectedDevice,
    scanning,
    scanForDevices,
    toggleConnection,
    sendData,
  };
}
