import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../utils/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const isEmployer = user?.role === 'employer';
  const isWorker = user?.role === 'worker';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="headlineMedium" style={styles.greeting}>
                Welcome back!
              </Text>
              <Text variant="bodyLarge" style={styles.email}>
                {user?.email}
              </Text>
            </View>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Notifications' as never)}
              icon="bell"
            >
              <Chip icon="circle" mode="outlined" style={styles.notificationBadge}>
                3
              </Chip>
            </Button>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <StatsCard
              icon="briefcase"
              label={isEmployer ? 'Active Shifts' : 'Shifts Worked'}
              value="12"
              color={colors.primary}
            />
            <StatsCard
              icon="clock-outline"
              label="Hours This Week"
              value="24"
              color={colors.success}
            />
            <StatsCard
              icon="currency-gbp"
              label="Earnings"
              value="£480"
              color={colors.warning}
            />
            <StatsCard
              icon="star"
              label="Rating"
              value="4.8"
              color={colors.primary}
            />
          </View>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Card.Title title="Quick Actions" />
            <Card.Content>
              <View style={styles.actions}>
                {isEmployer ? (
                  <>
                    <ActionButton
                      icon="plus-circle"
                      label="Post Shift"
                      onPress={() => navigation.navigate('CreateShift' as never)}
                    />
                    <ActionButton
                      icon="account-search"
                      label="Browse Workers"
                      onPress={() => navigation.navigate('BrowseWorkers' as never)}
                    />
                    <ActionButton
                      icon="account-group"
                      label="My Team"
                      onPress={() => navigation.navigate('TeamTab' as never)}
                    />
                    <ActionButton
                      icon="chart-line"
                      label="Analytics"
                      onPress={() => {}}
                    />
                  </>
                ) : isWorker ? (
                  <>
                    <ActionButton
                      icon="magnify"
                      label="Find Shifts"
                      onPress={() => navigation.navigate('ShiftsTab' as never)}
                    />
                    <ActionButton
                      icon="calendar"
                      label="My Availability"
                      onPress={() => navigation.navigate('Availability' as never)}
                    />
                    <ActionButton
                      icon="clock-check"
                      label="Timesheets"
                      onPress={() => {}}
                    />
                    <ActionButton
                      icon="wallet"
                      label="Earnings"
                      onPress={() => {}}
                    />
                  </>
                ) : (
                  <>
                    <ActionButton
                      icon="account-search"
                      label="Browse Workers"
                      onPress={() => navigation.navigate('BrowseWorkers' as never)}
                    />
                    <ActionButton
                      icon="briefcase"
                      label="Find Services"
                      onPress={() => navigation.navigate('ShiftsTab' as never)}
                    />
                    <ActionButton
                      icon="message"
                      label="Messages"
                      onPress={() => navigation.navigate('MessagesTab' as never)}
                    />
                    <ActionButton
                      icon="account"
                      label="Profile"
                      onPress={() => navigation.navigate('ProfileTab' as never)}
                    />
                  </>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Upcoming Shifts */}
          <Card style={styles.card}>
            <Card.Title
              title="Upcoming Shifts"
              right={(props) => (
                <Button {...props} mode="text">
                  See All
                </Button>
              )}
            />
            <Card.Content>
              <ShiftItem
                title="Waiter - Evening Service"
                location="Restaurant ABC, London"
                date="Tomorrow, 18:00 - 23:00"
                pay="£12.50/hr"
              />
              <ShiftItem
                title="Bartender - Weekend"
                location="The Crown Pub, Manchester"
                date="Sat, 12:00 - 20:00"
                pay="£13.00/hr"
              />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {isEmployer && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateShift' as never)}
          label="Post Shift"
        />
      )}
    </SafeAreaView>
  );
};

const StatsCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <Card style={styles.statsCard}>
    <Card.Content style={styles.statsContent}>
      <Icon name={icon} size={24} color={color} />
      <Text variant="headlineSmall" style={styles.statsValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statsLabel}>
        {label}
      </Text>
    </Card.Content>
  </Card>
);

const ActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <Button
    mode="outlined"
    icon={icon}
    onPress={onPress}
    style={styles.actionButton}
    contentStyle={styles.actionButtonContent}
  >
    {label}
  </Button>
);

const ShiftItem: React.FC<{
  title: string;
  location: string;
  date: string;
  pay: string;
}> = ({ title, location, date, pay }) => (
  <View style={styles.shiftItem}>
    <View style={styles.shiftInfo}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodySmall" style={styles.shiftLocation}>
        <Icon name="map-marker" size={12} /> {location}
      </Text>
      <Text variant="bodySmall" style={styles.shiftDate}>
        <Icon name="clock" size={12} /> {date}
      </Text>
    </View>
    <View style={styles.shiftPay}>
      <Text variant="titleMedium" style={styles.payAmount}>
        {pay}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontWeight: 'bold',
  },
  email: {
    color: colors.textSecondary,
  },
  notificationBadge: {
    height: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
  },
  statsContent: {
    alignItems: 'center',
    gap: 4,
  },
  statsValue: {
    fontWeight: 'bold',
  },
  statsLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  shiftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shiftInfo: {
    flex: 1,
    gap: 4,
  },
  shiftLocation: {
    color: colors.textSecondary,
  },
  shiftDate: {
    color: colors.textSecondary,
  },
  shiftPay: {
    justifyContent: 'center',
  },
  payAmount: {
    color: colors.success,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});

export default HomeScreen;
