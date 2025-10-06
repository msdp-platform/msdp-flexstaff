import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';

const ShiftDetailScreen = ({ route }: any) => {
  const { id } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Title title="Shift Details" subtitle={`ID: ${id}`} />
          <Card.Content>
            <Text>Full shift details will be displayed here</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Apply for Shift</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { margin: 16 },
});

export default ShiftDetailScreen;
