import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';

const ChatScreen = () => {
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <IconButton icon="send" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  messageList: { padding: 16 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 50 },
  inputContainer: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background },
});

export default ChatScreen;
