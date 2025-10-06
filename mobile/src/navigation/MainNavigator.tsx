import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/theme';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ShiftsScreen from '../screens/main/ShiftsScreen';
import ShiftDetailScreen from '../screens/main/ShiftDetailScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import TimesheetScreen from '../screens/main/TimesheetScreen';
import CreateShiftScreen from '../screens/main/CreateShiftScreen';
import BrowseWorkersScreen from '../screens/BrowseWorkersScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import MyTeamScreen from '../screens/MyTeamScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  ShiftsTab: undefined;
  MessagesTab: undefined;
  TeamTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Timesheet: { id: string };
  CreateShift: undefined;
  BrowseWorkers: undefined;
  Availability: undefined;
};

export type ShiftsStackParamList = {
  Shifts: undefined;
  ShiftDetail: { id: string };
};

export type MessagesStackParamList = {
  Messages: undefined;
  Chat: { userId: string; userName: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type TeamStackParamList = {
  MyTeam: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ShiftsStack = createStackNavigator<ShiftsStackParamList>();
const MessagesStack = createStackNavigator<MessagesStackParamList>();
const TeamStack = createStackNavigator<TeamStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Dashboard' }}
    />
    <HomeStack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <HomeStack.Screen
      name="Timesheet"
      component={TimesheetScreen}
      options={{ title: 'Timesheet' }}
    />
    <HomeStack.Screen
      name="CreateShift"
      component={CreateShiftScreen}
      options={{ title: 'Post New Shift' }}
    />
    <HomeStack.Screen
      name="BrowseWorkers"
      component={BrowseWorkersScreen}
      options={{ title: 'Browse Workers' }}
    />
    <HomeStack.Screen
      name="Availability"
      component={AvailabilityScreen}
      options={{ title: 'My Availability' }}
    />
  </HomeStack.Navigator>
);

// Shifts Stack
const ShiftsStackNavigator = () => (
  <ShiftsStack.Navigator>
    <ShiftsStack.Screen
      name="Shifts"
      component={ShiftsScreen}
      options={{ title: 'Available Shifts' }}
    />
    <ShiftsStack.Screen
      name="ShiftDetail"
      component={ShiftDetailScreen}
      options={{ title: 'Shift Details' }}
    />
  </ShiftsStack.Navigator>
);

// Messages Stack
const MessagesStackNavigator = () => (
  <MessagesStack.Navigator>
    <MessagesStack.Screen
      name="Messages"
      component={MessagesScreen}
      options={{ title: 'Messages' }}
    />
    <MessagesStack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({ title: route.params.userName })}
    />
  </MessagesStack.Navigator>
);

// Team Stack
const TeamStackNavigator = () => (
  <TeamStack.Navigator>
    <TeamStack.Screen
      name="MyTeam"
      component={MyTeamScreen}
      options={{ title: 'My Team' }}
    />
  </TeamStack.Navigator>
);

// Profile Stack
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </ProfileStack.Navigator>
);

// Main Tab Navigator
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ShiftsTab':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'MessagesTab':
              iconName = focused ? 'message' : 'message-outline';
              break;
            case 'TeamTab':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="ShiftsTab"
        component={ShiftsStackNavigator}
        options={{ title: 'Shifts' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen
        name="TeamTab"
        component={TeamStackNavigator}
        options={{ title: 'Team' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
