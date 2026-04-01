import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ControlSlider } from '@/components/ControlSlider';
import { useBluetooth, Device } from '@/hooks/useBluetooth'; // Adicionado Device caso precise tipar

const SEND_INTERVAL_MS = 5;
const SPEED_MIN = -255;
const SPEED_MAX = 255;
const STEERING_MIN = 40;
const STEERING_MAX = 140;
const DEFAULT_CENTER = 90;

export default function App() {
  const [speed, setSpeed] = useState(0);
  const [steering, setSteering] = useState(DEFAULT_CENTER);
  const [steeringCenter, setSteeringCenter] = useState(DEFAULT_CENTER);
  const [inputCenter, setInputCenter] = useState(DEFAULT_CENTER.toString());
  
  // Novo estado para o popup do Bluetooth
  const [modalVisible, setModalVisible] = useState(false);
  
  const {
    devices,
    connectedDevice,
    scanning,
    scanForDevices,
    toggleConnection,
    sendData,
  } = useBluetooth();

  const lastSentRef = useRef<{ speed: number; steering: number } | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden"); 
      NavigationBar.setBehaviorAsync("swipe");    
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT); };
  }, []);

  // --- LOOP DE ENVIO ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectedDevice) return;
      if (lastSentRef.current?.speed === speed && lastSentRef.current?.steering === steering) return;

      sendData(speed, steering);
      console.log(`Enviado: Speed=${speed.toFixed(0)}% Steering=${steering.toFixed(0)}°`);
      lastSentRef.current = { speed, steering };
    }, SEND_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [speed, steering, connectedDevice, sendData]);

  // Função para lidar com a seleção do dispositivo no Modal
  const handleDeviceSelect = async (device: Device) => {
    await toggleConnection(device);
    setModalVisible(false); // Fecha o popup após selecionar o dispositivo
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.mainContainer}>
        
        {/* LADO ESQUERDO: DIREÇÃO (HORIZONTAL) */}
        <View style={styles.controlSection}>
          <View style={styles.displayBadge}>
            <Text style={styles.badgeLabel}>DIREÇÃO</Text>
            <Text style={styles.badgeValue}>{steering.toFixed(0)}°</Text>
          </View>
          
          <ControlSlider
            minimumValue={STEERING_MIN} // STEERING_MIN
            maximumValue={STEERING_MAX} // STEERING_MAX
            value={steering}
            onValueChange={setSteering}
            onSlidingComplete={() => setSteering(90)} // Retorna ao centro ao soltar
            color="#0a84ff"
            centerValue={DEFAULT_CENTER} // Marca o centro no trilho
          />

          <Text style={styles.helperText}>Arraste para virar • Solte para centralizar</Text>
        </View>

        {/* CENTRO: STATUS E CONFIGURAÇÕES */}
        <View style={styles.menuSection}>
          <Text style={styles.brand}>KAMIKASE <Text style={styles.version}>V4</Text></Text>
          
          <View style={[styles.statusIndicator, connectedDevice ? styles.bgOn : styles.bgOff]}>
            <Text style={styles.statusText}>
              {connectedDevice ? `STATUS: ONLINE` : 'STATUS: OFFLINE'}
            </Text>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configTitle}>Calibração de centro da direção</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input 
                  value={inputCenter} 
                  onChangeText={setInputCenter} 
                  keyboardType="numeric" 
                  placeholder="Centro"
                />
              </View>
              <View style={{ width: 10 }} />
              <Button label="SET" onPress={() => {
                const v = parseInt(inputCenter);
                if(!isNaN(v)) { setSteeringCenter(v); setSteering(v); }
              }} style={styles.smallBtn} />
            </View>
          </View>

          {/* Botão para abrir o modal de Bluetooth */}
          <Button 
            label={connectedDevice ? `CONECTADO: ${connectedDevice.name || connectedDevice.id}` : "CONECTAR BLUETOOTH"} 
            onPress={() => setModalVisible(true)} 
            style={connectedDevice ? styles.btnConnected : styles.btnDisconnected}
          />
        </View>

        {/* LADO DIREITO: VELOCIDADE (VERTICAL) */}
        <View style={styles.controlSection}>
          <View style={styles.displayBadge}>
            <Text style={styles.badgeLabel}>MOTOR</Text>
            <Text style={[styles.badgeValue, { color: '#ff4c4c' }]}>{speed.toFixed(0)}%</Text>
          </View>
          
          <ControlSlider
            minimumValue={SPEED_MIN} // SPEED_MIN
            maximumValue={SPEED_MAX} // SPEED_MAX
            value={speed}
            onValueChange={setSpeed}
            onSlidingComplete={() => setSpeed(0)} // Zera o motor ao soltar
            color="#ff4c4c"
            centerValue={0} // Marca o 0 absoluto no trilho vertical
            vertical={true}
          />

          <Text style={styles.helperText}>FRENTE / RÉ</Text>
        </View>

      </View>

      {/* MODAL / POPUP DE BLUETOOTH */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dispositivos Bluetooth</Text>
            
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Button 
                  label={item.name || item.id} 
                  onPress={() => handleDeviceSelect(item)}
                  style={[styles.deviceBtn, connectedDevice?.id === item.id && styles.deviceActive]}
                />
              )}
              ListHeaderComponent={<Button label={scanning ? "Buscando..." : "BUSCAR DISPOSITIVOS"} onPress={scanForDevices} type="outline" style={{marginBottom: 10}} />}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <Button 
              label="FECHAR" 
              onPress={() => setModalVisible(false)} 
              style={styles.closeBtn} 
            />
          </View>
        </View>
      </Modal>

      <StatusBar style="light" hidden />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  mainContainer: { flex: 1, flexDirection: 'row', padding: 15 },
  
  controlSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  menuSection: {
    flex: 1.4,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  version: { color: '#0a84ff' },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
    marginVertical: 10,
  },
  bgOn: { backgroundColor: '#1b4332' },
  bgOff: { backgroundColor: '#431b1b' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  displayBadge: { alignItems: 'center', marginBottom: 20 },
  badgeLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  badgeValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: -5 },
  helperText: { color: '#444', fontSize: 10, marginTop: 10, fontWeight: 'bold' },

  horizontalSlider: { width: '100%', height: 40 },

  configCard: {
    width: '100%',
    backgroundColor: '#151515',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20, // Aumentado um pouco o espaçamento inferior
  },
  configTitle: { color: '#888', fontSize: 11, marginBottom: 8, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: { width: 60, height: 44 },

  btnConnected: { backgroundColor: '#1b4332', borderWidth: 1, borderColor: '#2d6a4f' },
  btnDisconnected: { backgroundColor: '#007AFF' },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '60%',
    maxHeight: '80%',
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  list: { width: '100%' },
  deviceBtn: { backgroundColor: '#2c2c2e', marginBottom: 8, height: 44 },
  deviceActive: { backgroundColor: '#0a84ff', borderColor: '#fff' },
  closeBtn: {
    marginTop: 15,
    backgroundColor: '#ff4c4c',
    width: '100%',
  }
});