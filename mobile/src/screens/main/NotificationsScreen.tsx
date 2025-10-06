import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Badge, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';

const NotificationsScreen = () => {
  const notifications = [
    { id: '1', title: 'New Shift Available', message: 'Waiter position at ABC Restaurant', time: '2h ago', read: false },
    { id: '2', title: 'Application Accepted', message: 'Your application was accepted', time: '1d ago', read: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.message}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => !item.read && <Badge>New</Badge>}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

export default NotificationsScreen;
