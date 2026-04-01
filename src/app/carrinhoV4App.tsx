import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useEffect} from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';
import {Input} from '@/components/Input';
import {Button} from '@/components/Button';

// --- CONFIGURAÇÃO ---
// A cada 50ms (20Hz) o app envia o último estado conhecido do controle
// para o módulo de comunicação (bluetooth / serial / ...).
const SEND_INTERVAL_MS = 50;

// Faixa de valores de velocidade em %.
// O firmware do ESP32 espera um int16 (2 bytes) em big-endian.
const SPEED_MIN = -100;
const SPEED_MAX = 155;

// O servo usa 40-140 graus.
const STEERING_MIN = 40;
const STEERING_MAX = 140;

export default function CarrinhoV4App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.direção}>
        <Text >Direção (Servo)</Text>
        <Text > **° </Text>
        <Slider
          minimumValue={SPEED_MIN}
          maximumValue={SPEED_MAX}
          minimumTrackTintColor="#0a84ff"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0a84ff"
        />
      </View>

      <View style={styles.menu}>
        <Text>Carrinho V4</Text>
        <View style={styles.form}>
          <Input placeholder='Digite o centro aqui = 90' keyboardType='numeric'/>
          <Button label='Adicionar ao Carrinho'/>
        </View>
      </View>

      <View style={styles.velocidade}>
        <Text >Aceleração (Motor)</Text>
        <Text > *** </Text>
        <Slider
          minimumValue={STEERING_MIN}
          maximumValue={STEERING_MAX}
          minimumTrackTintColor="#0a84ff"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0a84ff"
        />        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: "100%",
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: '#fdfdfd',
    padding: 32,
    gap: 16,
  },

  direção: {
    width: "100%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8d2c2c',
  },

  menu: {
    width: "100%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  form:{
    width: "100%",
    marginTop: 24,
    gap: 12,
  },

  velocidade: {
    width: "100%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8d2c2c',
  },
});