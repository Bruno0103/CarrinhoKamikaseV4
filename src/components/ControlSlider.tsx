import React, { useState, useRef } from 'react';
import { View, PointerEvent } from 'react-native';

interface ControlSliderProps {
  minimumValue: number; maximumValue: number; value: number;
  onValueChange: (value: number) => void; onSlidingComplete: () => void;
  color?: string; centerValue: number; vertical?: boolean;
}

export function ControlSlider({
  minimumValue, maximumValue, value, onValueChange, onSlidingComplete, color = '#0a84ff', centerValue, vertical
}: ControlSliderProps) {
  const [layoutSize, setLayoutSize] = useState(0);
  
  // Ref para controlar se o dedo está pressionando este controle específico
  const isDragging = useRef(false);
  
  // Lógica de cálculo da barra
  const range = maximumValue - minimumValue;
  const centerPct = ((centerValue - minimumValue) / range) * 100;
  const valuePct = ((value - minimumValue) / range) * 100;
  
  const startPct = Math.min(centerPct, valuePct);
  const sizePct = Math.abs(centerPct - valuePct);

  // Função centralizada para processar as coordenadas do toque
  const processTouch = (e: PointerEvent) => {
    if (layoutSize === 0) return;

    // Pega a posição X (horizontal) ou Y (vertical) relativa ao componente
    const pos = vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX;

    // Transforma a posição em porcentagem de 0 a 1
    let pct = pos / layoutSize;
    
    // Trava nos limites para a barra não estourar se o dedo sair da área
    pct = Math.max(0, Math.min(1, pct)); 

    if (vertical) {
        pct = 1 - pct; // Inverte o eixo Y para que arrastar para cima aumente o valor
    }

    const newValue = minimumValue + (pct * range);
    onValueChange(newValue);
  };

  // --- POINTER EVENTS (Suporte a Multi-Touch) ---
  const handlePointerDown = (e: PointerEvent) => {
    isDragging.current = true;
    processTouch(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging.current) {
      processTouch(e);
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    onSlidingComplete();
  };

  return (
    <View 
      style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      onLayout={(e) => {
        // Salva o tamanho do container (largura ou altura)
        setLayoutSize(vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width);
      }}
      // Eventos de ponteiro que não bloqueiam a tela
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      
      {/* 1. TRILHO DE FUNDO CINZA */}
      <View style={{
        position: 'absolute', backgroundColor: '#222', borderRadius: 8,
        ...(vertical 
            ? { width: 40, height: '100%' } 
            : { width: '100%', height: 40 })
      }} />

      {/* 2. PREENCHIMENTO ATIVO (Cresce do centro) */}
      <View style={{
        position: 'absolute', backgroundColor: color, borderRadius: 8,
        ...(vertical 
            ? { width: 40, height: `${sizePct}%`, bottom: `${startPct}%` } 
            : { width: `${sizePct}%`, height: 40, left: `${startPct}%` })
      }} />

      {/* 3. A BOLINHA (THUMB) */}
      <View style={{
        position: 'absolute',
        width: vertical ? 64 : 40,
        height: vertical ? 40 : 64,
        backgroundColor: color,
        borderRadius: 22,
        ...(vertical
            ? { bottom: `${valuePct}%`, marginBottom: -20 } 
            : { left: `${valuePct}%`, marginLeft: -20 })   
      }} />

    </View>
  );
}