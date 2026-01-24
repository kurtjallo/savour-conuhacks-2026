import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSizes } from '../lib/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, placeholder, onClear }: Props) {
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable style={styles.container} onPress={handleContainerPress}>
      <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search for eggs, milk, bread...'}
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSizes.lg,
    color: '#1A1A1A',
  },
  clearButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});
