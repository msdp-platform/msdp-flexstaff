import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';

const TimesheetScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Timesheet Management" />
          <Card.Content>
            <Text>Clock in/out and manage timesheets</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Clock In</Button>
            <Button mode="outlined">Clock Out</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16 },
  card: { backgroundColor: colors.background },
});

export default TimesheetScreen;
