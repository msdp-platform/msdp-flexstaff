import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/theme';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  experienceYears?: number;
}

interface Favorite {
  id: string;
  workerId: string;
  notes?: string;
  createdAt: string;
  worker: Worker;
}

const MyTeamScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch favorites');

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Failed to fetch your team');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (favoriteId: string, workerName: string) => {
    Alert.alert(
      'Remove from Team',
      `Are you sure you want to remove ${workerName} from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/favorites/${favoriteId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!response.ok) throw new Error('Failed to remove favorite');

              Alert.alert('Success', `${workerName} removed from your team`);
              fetchFavorites();
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove from team');
            }
          },
        },
      ]
    );
  };

  const handleUpdateNotes = (favoriteId: string) => {
    Alert.prompt(
      'Update Notes',
      'Add or update notes for this team member',
      async (notes) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/favorites/${favoriteId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ notes }),
            }
          );

          if (!response.ok) throw new Error('Failed to update notes');

          Alert.alert('Success', 'Notes updated successfully');
          fetchFavorites();
        } catch (error) {
          console.error('Error updating notes:', error);
          Alert.alert('Error', 'Failed to update notes');
        }
      },
      'plain-text',
      favorites.find((f) => f.id === favoriteId)?.notes || ''
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
          My Team
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your favorite workers for quick access
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No team members yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Browse workers and add them to your team for quick access
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <Card key={favorite.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleLarge" style={styles.workerName}>
                    {favorite.worker.firstName} {favorite.worker.lastName}
                  </Text>
                  <IconButton
                    icon="heart"
                    iconColor={colors.error}
                    size={24}
                    onPress={() =>
                      handleRemoveFavorite(
                        favorite.id,
                        `${favorite.worker.firstName} ${favorite.worker.lastName}`
                      )
                    }
                  />
                </View>

                {favorite.worker.bio && (
                  <Text variant="bodyMedium" style={styles.bio}>
                    {favorite.worker.bio}
                  </Text>
                )}

                <View style={styles.detailsContainer}>
                  {favorite.worker.experienceYears !== undefined && (
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.label}>
                        Experience:
                      </Text>
                      <Text variant="bodyMedium" style={styles.value}>
                        {favorite.worker.experienceYears} years
                      </Text>
                    </View>
                  )}

                  {favorite.worker.hourlyRate !== undefined && (
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.label}>
                        Rate:
                      </Text>
                      <Text variant="bodyMedium" style={[styles.value, styles.rate]}>
                        £{favorite.worker.hourlyRate}/hour
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Added:
                    </Text>
                    <Text variant="bodyMedium" style={styles.value}>
                      {new Date(favorite.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {favorite.worker.skills && favorite.worker.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text variant="bodySmall" style={styles.skillsLabel}>
                      Skills:
                    </Text>
                    <View style={styles.skills}>
                      {favorite.worker.skills.map((skill, index) => (
                        <Chip key={index} mode="outlined" compact style={styles.skillChip}>
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {favorite.notes && (
                  <View style={styles.notesContainer}>
                    <Text variant="bodySmall" style={styles.notesLabel}>
                      Notes:
                    </Text>
                    <Text variant="bodySmall" style={styles.notes}>
                      {favorite.notes}
                    </Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions>
                <Button onPress={() => handleUpdateNotes(favorite.id)}>
                  {favorite.notes ? 'Update Notes' : 'Add Notes'}
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
    textAlign: 'center',
    paddingHorizontal: 20,
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
    minWidth: 90,
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
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  notes: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default MyTeamScreen;
