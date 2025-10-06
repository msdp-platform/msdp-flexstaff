import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { TextInput, IconButton, Text, Card, ActivityIndicator, Banner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MessagesStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../utils/theme';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  shiftId?: string;
  readAt?: string;
  createdAt: string;
  sender: {
    email: string;
  };
  receiver: {
    email: string;
  };
  shift?: {
    id: string;
    title: string;
    shiftDate: string;
    startTime: string;
  };
}

interface ChatAllowed {
  allowed: boolean;
  shift?: {
    id: string;
    title: string;
    date: string;
    startTime: string;
  };
  minutesUntilAllowed?: number;
  minutesRemaining?: number;
}

type ChatScreenRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { userId, userName } = route.params;
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [shiftId, setShiftId] = useState<string | undefined>();
  const [chatAllowed, setChatAllowed] = useState<ChatAllowed | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (shiftId) {
      checkChatAllowed(shiftId);
    }
  }, [shiftId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages);

      // If there's a shift-related message, get the shiftId
      const shiftMessage = data.messages.find((msg: Message) => msg.shiftId);
      if (shiftMessage) {
        setShiftId(shiftMessage.shiftId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkChatAllowed = async (shiftId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/messages/check-chat/${shiftId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to check chat availability');

      const data = await response.json();
      setChatAllowed(data);
    } catch (error) {
      console.error('Error checking chat availability:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Check if chat is allowed (for shift-related messages)
    if (shiftId && chatAllowed && !chatAllowed.allowed) {
      Alert.alert(
        'Chat Unavailable',
        `Chat is only available within 1 hour of the shift time. Please wait ${chatAllowed.minutesUntilAllowed} minutes.`
      );
      return;
    }

    setSending(true);
    const messageText = message.trim();
    setMessage('');

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          receiverId: userId,
          messageText,
          shiftId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to send message');
        setMessage(messageText); // Restore message
        return;
      }

      await fetchMessages();
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessage(messageText); // Restore message
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.senderId === user?.id;

    return (
      <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
        <Card style={[styles.messageCard, isSent ? styles.sentCard : styles.receivedCard]}>
          <Card.Content>
            <Text variant="bodyMedium" style={isSent ? styles.sentText : styles.receivedText}>
              {item.messageText}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {shiftId && chatAllowed && chatAllowed.shift && (
        <Banner
          visible={true}
          icon={chatAllowed.allowed ? 'check-circle' : 'clock-alert'}
          style={styles.banner}
        >
          {chatAllowed.allowed
            ? `Chat available for ${chatAllowed.minutesRemaining} more minutes (${chatAllowed.shift.title})`
            : `Chat unavailable. Available ${chatAllowed.minutesUntilAllowed} minutes before shift (${chatAllowed.shift.title})`}
        </Banner>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with {userName}</Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={styles.input}
          disabled={sending || (shiftId && chatAllowed && !chatAllowed.allowed)}
          multiline
          maxLength={1000}
        />
        <IconButton
          icon="send"
          onPress={handleSend}
          disabled={!message.trim() || sending || (shiftId && chatAllowed && !chatAllowed.allowed)}
          iconColor={
            !message.trim() || sending || (shiftId && chatAllowed && !chatAllowed.allowed)
              ? colors.textSecondary
              : colors.primary
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    backgroundColor: colors.primary + '20',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textSecondary,
    opacity: 0.7,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    elevation: 1,
  },
  sentCard: {
    backgroundColor: colors.primary,
  },
  receivedCard: {
    backgroundColor: '#fff',
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: colors.text,
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
  },
  sentTimestamp: {
    color: '#fff',
    opacity: 0.8,
  },
  receivedTimestamp: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    maxHeight: 100,
  },
});

export default ChatScreen;
