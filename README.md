# Carrinho Kamikase V3

Controle remoto móvel para o carrinho Kamikase (ESP32) via Bluetooth.

## O que já está implementado

- UI com controles de **aceleração** (motor) e **direção** (servo)
- **Throttle** interno: os comandos são empacotados e enviados a cada 20ms, evitando "flood" de mensagens
- Conversão de valores para o formato esperado pelo firmware:
  - 2 bytes (int16 big-endian) para velocidade
  - 1 byte para direção (0-180)

> OBS: Agora o app já implementa **Bluetooth Classic (serial)** usando `react-native-bluetooth-serial-next`, enviando os 3 bytes diretamente para o ESP32.

## Como executar

> 🔥 **Atenção:** como o projeto utiliza um módulo nativo (`react-native-bluetooth-serial-next`), você precisa rodar em um **custom dev client** (Expo Development Client) ou em uma build nativa (EAS).

```bash
npm install
# Gerar um dev client (requer EAS CLI):
# eas build --profile development --platform android

# Ou, se você já tiver um dev client instalado:
npm run android
```

Para rodar no celular:
1. Abra o app (Expo Dev Client) no celular.
2. Aponte a câmera para o QR code exibido no terminal.

## Como usar o Bluetooth

1. Abra o app e clique em **Buscar** para listar dispositivos pareados ou disponíveis.
2. Se o ESP32 estiver pareado e nomeado como **"Carrinho Kamikase"**, clique em **Conectar ao Carrinho**.
3. Ao conectar, os comandos são enviados automaticamente a cada 50ms (throttle) enquanto você mexe nos sliders.

> Dica: em alguns aparelhos Android, você precisa parear o ESP32 nas configurações de Bluetooth antes de conectar pelo app.


