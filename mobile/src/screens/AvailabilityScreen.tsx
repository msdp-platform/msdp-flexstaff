import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  Chip,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface Availability {
  id: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  notes: string;
  status: string;
  bookedByEmployer?: {
    companyName: string;
  };
  bookedAt?: string;
}

const AvailabilityScreen: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [formData, setFormData] = useState({
    availabilityDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    hourlyRate: '',
    notes: '',
  });

  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/availability/my-availability`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch availabilities');

      const data = await response.json();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      Alert.alert('Error', 'Failed to fetch your availability');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (availability?: Availability) => {
    if (availability) {
      setEditingId(availability.id);
      setFormData({
        availabilityDate: new Date(availability.availabilityDate),
        startTime: new Date(`2000-01-01T${availability.startTime}`),
        endTime: new Date(`2000-01-01T${availability.endTime}`),
        hourlyRate: availability.hourlyRate.toString(),
        notes: availability.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        availabilityDate: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        hourlyRate: '',
        notes: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.hourlyRate) {
      Alert.alert('Validation Error', 'Please enter an hourly rate');
      return;
    }

    const data = {
      availabilityDate: formData.availabilityDate.toISOString().split('T')[0],
      startTime: formData.startTime.toTimeString().split(' ')[0].substring(0, 5),
      endTime: formData.endTime.toTimeString().split(' ')[0].substring(0, 5),
      hourlyRate: parseFloat(formData.hourlyRate),
      notes: formData.notes,
    };

    try {
      const url = editingId
        ? `${process.env.EXPO_PUBLIC_API_URL}/availability/${editingId}`
        : `${process.env.EXPO_PUBLIC_API_URL}/availability`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to save availability');
        return;
      }

      Alert.alert('Success', `Availability ${editingId ? 'updated' : 'created'} successfully`);
      closeModal();
      fetchAvailabilities();
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this availability slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/availability/${id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!response.ok) throw new Error('Failed to delete availability');

            Alert.alert('Success', 'Availability deleted successfully');
            fetchAvailabilities();
          } catch (error) {
            console.error('Error deleting availability:', error);
            Alert.alert('Error', 'Failed to delete availability');
          }
        },
      },
    ]);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, availabilityDate: selectedDate });
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData({ ...formData, startTime: selectedTime });
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData({ ...formData, endTime: selectedTime });
    }
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
          My Availability
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage your availability calendar
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {availabilities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No availability slots yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to add your first availability
            </Text>
          </View>
        ) : (
          availabilities.map((slot) => (
            <Card key={slot.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.date}>
                    {new Date(slot.availabilityDate).toLocaleDateString()}
                  </Text>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      slot.status === 'booked' && styles.bookedChip,
                      slot.status === 'cancelled' && styles.cancelledChip,
                    ]}
                  >
                    {slot.status}
                  </Chip>
                </View>

                <View style={styles.detailsContainer}>
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

                  {slot.notes && (
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.label}>
                        Notes:
                      </Text>
                      <Text variant="bodySmall" style={styles.notes}>
                        {slot.notes}
                      </Text>
                    </View>
                  )}

                  {slot.status === 'booked' && slot.bookedByEmployer && (
                    <View style={styles.bookingInfo}>
                      <Text variant="bodySmall" style={styles.bookingLabel}>
                        Booked by:
                      </Text>
                      <Text variant="bodyMedium" style={styles.employerName}>
                        {slot.bookedByEmployer.companyName}
                      </Text>
                      {slot.bookedAt && (
                        <Text variant="bodySmall" style={styles.bookingDate}>
                          on {new Date(slot.bookedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </Card.Content>

              <Card.Actions>
                {slot.status === 'available' && (
                  <>
                    <Button onPress={() => openModal(slot)}>Edit</Button>
                    <Button onPress={() => handleDelete(slot.id)} textColor={colors.error}>
                      Delete
                    </Button>
                  </>
                )}
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => openModal()}
        label="Add Availability"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {editingId ? 'Edit Availability' : 'Add Availability'}
            </Text>

            <View style={styles.formGroup}>
              <Text variant="bodyMedium" style={styles.inputLabel}>
                Date
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {formData.availabilityDate.toLocaleDateString()}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.availabilityDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.timeContainer}>
              <View style={[styles.formGroup, styles.timeGroup]}>
                <Text variant="bodyMedium" style={styles.inputLabel}>
                  Start Time
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowStartTimePicker(true)}
                  style={styles.dateButton}
                >
                  {formData.startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="time"
                    display="default"
                    onChange={onStartTimeChange}
                  />
                )}
              </View>

              <View style={[styles.formGroup, styles.timeGroup]}>
                <Text variant="bodyMedium" style={styles.inputLabel}>
                  End Time
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowEndTimePicker(true)}
                  style={styles.dateButton}
                >
                  {formData.endTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="time"
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            </View>

            <TextInput
              label="Hourly Rate (£) *"
              value={formData.hourlyRate}
              onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              left={<TextInput.Icon icon="currency-gbp" />}
            />

            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="note-text" />}
            />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={closeModal} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
                {editingId ? 'Update' : 'Create'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 80,
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
  date: {
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  bookedChip: {
    backgroundColor: colors.success + '20',
  },
  cancelledChip: {
    backgroundColor: colors.error + '20',
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 60,
  },
  value: {
    color: colors.textSecondary,
    flex: 1,
  },
  rate: {
    color: colors.primary,
    fontWeight: '600',
  },
  notes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  bookingInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  bookingLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  employerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDate: {
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeGroup: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default AvailabilityScreen;
