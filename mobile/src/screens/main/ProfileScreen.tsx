import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../utils/theme';

const ProfileScreen = () => {
  const { user, clearAuth } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Avatar.Text size={80} label={user?.email[0].toUpperCase() || 'U'} />
        </View>
        <List.Section>
          <List.Item title="Email" description={user?.email} left={(props) => <List.Icon {...props} icon="email" />} />
          <List.Item title="Role" description={user?.role} left={(props) => <List.Icon {...props} icon="account" />} />
          <Divider />
          <List.Item title="Settings" left={(props) => <List.Icon {...props} icon="cog" />} onPress={() => {}} />
          <List.Item title="Payment Methods" left={(props) => <List.Icon {...props} icon="credit-card" />} onPress={() => {}} />
          <List.Item title="Help & Support" left={(props) => <List.Icon {...props} icon="help-circle" />} onPress={() => {}} />
          <Divider />
          <List.Item title="Logout" left={(props) => <List.Icon {...props} icon="logout" />} onPress={clearAuth} />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: 24 },
});

export default ProfileScreen;
