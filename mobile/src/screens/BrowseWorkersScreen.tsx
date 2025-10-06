import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Chip, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

interface WorkerAvailability {
  id: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  notes: string;
  status: string;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    skills?: string[];
    bio?: string;
  };
}

const BrowseWorkersScreen: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchAvailableWorkers();
  }, [filterDate]);

  const fetchAvailableWorkers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/availability/available-workers?${params}`
      );

      if (!response.ok) throw new Error('Failed to fetch available workers');

      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      console.error('Error fetching available workers:', error);
      Alert.alert('Error', 'Failed to fetch available workers');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId: string, workerName: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to book a worker',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
        ]
      );
      return;
    }

    if (user?.role !== 'employer') {
      Alert.alert('Not Authorized', 'Only employers can book workers');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Are you sure you want to book ${workerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: async () => {
            try {
              const token = useAuthStore.getState().accessToken;
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/availability/${slotId}/book`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!response.ok) {
                const error = await response.json();
                Alert.alert('Booking Failed', error.message || 'Failed to book worker');
                return;
              }

              Alert.alert(
                'Success',
                'Worker booked successfully! Both you and the worker will receive invitation notifications.'
              );
              fetchAvailableWorkers();
            } catch (error) {
              console.error('Error booking worker:', error);
              Alert.alert('Error', 'Failed to book worker');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Browse Available Workers
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Find and book skilled workers for your needs
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          label="Filter by Date"
          value={filterDate}
          onChangeText={setFilterDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.dateInput}
          left={<TextInput.Icon icon="calendar" />}
          right={
            filterDate ? (
              <TextInput.Icon icon="close" onPress={() => setFilterDate('')} />
            ) : undefined
          }
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {workers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No available workers found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        ) : (
          workers.map((slot) => (
            <Card key={slot.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleLarge" style={styles.workerName}>
                    {slot.worker.firstName} {slot.worker.lastName}
                  </Text>
                  <Chip mode="outlined" style={styles.statusChip}>
                    {slot.status}
                  </Chip>
                </View>

                {slot.worker.bio && (
                  <Text variant="bodyMedium" style={styles.bio}>
                    {slot.worker.bio}
                  </Text>
                )}

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Date:
                    </Text>
                    <Text variant="bodyMedium" style={styles.value}>
                      {new Date(slot.availabilityDate).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Time:
                    </Text>
                    <Text variant="bodyMedium" style={styles.value}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Rate:
                    </Text>
                    <Text variant="bodyMedium" style={[styles.value, styles.rate]}>
                      £{slot.hourlyRate}/hour
                    </Text>
                  </View>
                </View>

                {slot.worker.skills && slot.worker.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text variant="bodySmall" style={styles.skillsLabel}>
                      Skills:
                    </Text>
                    <View style={styles.skills}>
                      {slot.worker.skills.map((skill, index) => (
                        <Chip key={index} mode="outlined" compact style={styles.skillChip}>
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {slot.notes && (
                  <View style={styles.notesContainer}>
                    <Text variant="bodySmall" style={styles.notesLabel}>
                      Notes:
                    </Text>
                    <Text variant="bodySmall" style={styles.notes}>
                      {slot.notes}
                    </Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() =>
                    handleBook(slot.id, `${slot.worker.firstName} ${slot.worker.lastName}`)
                  }
                  style={styles.bookButton}
                >
                  Book Now
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dateInput: {
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.textSecondary,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerName: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  bio: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 60,
  },
  value: {
    color: colors.textSecondary,
  },
  rate: {
    color: colors.primary,
    fontWeight: '600',
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  notesContainer: {
    marginBottom: 8,
  },
  notesLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  notes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bookButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default BrowseWorkersScreen;
