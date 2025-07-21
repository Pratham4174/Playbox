import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Sport } from '../type/types';

type Props = {
  sport: Sport;
  onPress: () => void;
};

export default function SportCard({ sport, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{sport.name}</Text>
      <Text style={styles.slots}>{sport.slots.length} slots available</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  slots: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
});
