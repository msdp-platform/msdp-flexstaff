import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar, Button, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../utils/theme';
import { useQuery } from '@tanstack/react-query';
import { shiftAPI } from '../../services/api';

const ShiftsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftAPI.getShifts({ status: 'open' }),
  });

  const shifts = data?.data?.shifts || [];

  const renderShift = ({ item }: any) => (
    <Card
      style={styles.shiftCard}
      onPress={() => navigation.navigate('ShiftDetail' as never, { id: item.id } as never)}
    >
      <Card.Content>
        <View style={styles.shiftHeader}>
          <Text variant="titleLarge" style={styles.shiftTitle}>
            {item.title}
          </Text>
          <Chip icon="currency-gbp" mode="flat" style={styles.payChip}>
            £{item.hourlyRate}/hr
          </Chip>
        </View>

        <View style={styles.shiftDetails}>
          <DetailRow icon="office-building" text={item.industry} />
          <DetailRow icon="map-marker" text={`${item.city}, ${item.postcode}`} />
          <DetailRow icon="calendar" text={item.shiftDate} />
          <DetailRow icon="clock" text={`${item.startTime} - ${item.endTime}`} />
          <DetailRow
            icon="account-group"
            text={`${item.filledPositions}/${item.totalPositions} filled`}
          />
        </View>

        <View style={styles.shiftFooter}>
          <Chip icon="star" mode="outlined" style={styles.ratingChip}>
            4.5 Rating
          </Chip>
          <Button mode="contained" onPress={() => {}}>
            Apply
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search shifts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Hospitality', 'Retail', 'Healthcare', 'Events']}
          renderItem={({ item }) => (
            <Chip
              selected={filter === item.toLowerCase()}
              onPress={() => setFilter(item.toLowerCase())}
              style={styles.filterChip}
            >
              {item}
            </Chip>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={shifts}
        renderItem={renderShift}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="briefcase-off" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyText}>
              No shifts available
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check back later for new opportunities
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={16} color={colors.textSecondary} />
    <Text variant="bodyMedium" style={styles.detailText}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchbar: {
    backgroundColor: colors.background,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  shiftCard: {
    backgroundColor: colors.background,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  payChip: {
    backgroundColor: colors.success + '20',
  },
  shiftDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: colors.text,
  },
  shiftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingChip: {},
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyText: {
    color: colors.text,
  },
  emptySubtext: {
    color: colors.textSecondary,
  },
});

export default ShiftsScreen;
