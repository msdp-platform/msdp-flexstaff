import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';

const CreateShiftScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.header}>Create New Shift</Text>
        <TextInput label="Shift Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
        <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={4} style={styles.input} />
        <Button mode="contained" style={styles.button}>Post Shift</Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  header: { fontWeight: 'bold' },
  input: { backgroundColor: colors.background },
  button: { marginTop: 16 },
});

export default CreateShiftScreen;
