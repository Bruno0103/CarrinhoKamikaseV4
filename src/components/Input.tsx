import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export function Input({ ...rest }: TextInputProps) {
  return (
    <TextInput 
      style={styles.input} 
      placeholderTextColor="#888"
      {...rest} 
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    fontSize: 14,
    paddingLeft: 10,
  },
});