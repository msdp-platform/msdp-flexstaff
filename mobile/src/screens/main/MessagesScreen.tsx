import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Avatar, Badge, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';

const MessagesScreen = () => {
  const navigation = useNavigation();

  const conversations = [
    { id: '1', name: 'John Doe', lastMessage: 'Thanks for the shift!', unread: 2, time: '10:30' },
    { id: '2', name: 'ABC Restaurant', lastMessage: 'Can you start at 6?', unread: 0, time: 'Yesterday' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.lastMessage}
            left={(props) => <Avatar.Text {...props} label={item.name[0]} />}
            right={(props) => (
              <View>
                <Text>{item.time}</Text>
                {item.unread > 0 && <Badge>{item.unread}</Badge>}
              </View>
            )}
            onPress={() => navigation.navigate('Chat' as never, { userId: item.id, userName: item.name } as never)}
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

export default MessagesScreen;
