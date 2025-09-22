import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Mock courier profile data
const mockCourierProfile = {
  name: "Ahmed Hassan",
  id: "PCG-C001",
  email: "ahmed.hassan@parcego.com",
  phone: "+1 (555) 123-4567",
  joinDate: "January 15, 2024",
  totalDeliveries: 1247,
  rating: 4.8,
  totalEarnings: 18450.75,
  vehicle: {
    type: "Motorcycle",
    plate: "ABC-123",
    color: "Blue"
  },
  documents: {
    license: "Valid",
    insurance: "Valid",
    backgroundCheck: "Cleared"
  }
};

const mockProfileOptions = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Update your contact details and preferences",
    icon: "person-outline" as keyof typeof Ionicons.glyphMap,
    color: "#3b82f6",
    action: "personal"
  },
  {
    id: "vehicle",
    title: "Vehicle Information",
    description: "Manage your delivery vehicle details",
    icon: "car-outline" as keyof typeof Ionicons.glyphMap,
    color: "#10b981",
    action: "vehicle"
  },
  {
    id: "documents",
    title: "Documents & Verification",
    description: "Upload and manage your documents",
    icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
    color: "#f59e0b",
    action: "documents"
  },
  {
    id: "earnings",
    title: "Earnings & Payments",
    description: "View earnings history and payment methods",
    icon: "cash-outline" as keyof typeof Ionicons.glyphMap,
    color: "#8b5cf6",
    action: "earnings"
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage notification preferences",
    icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
    color: "#ef4444",
    action: "notifications"
  },
  {
    id: "support",
    title: "Help & Support",
    description: "Get help and contact support",
    icon: "help-circle-outline" as keyof typeof Ionicons.glyphMap,
    color: "#6b7280",
    action: "support"
  }
];

export default function ProfileScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleProfileAction = (action: string) => {
    handleHapticFeedback();
    
    switch (action) {
      case "personal":
        Alert.alert("Personal Information", "Personal information settings would open here");
        break;
      case "vehicle":
        Alert.alert("Vehicle Information", "Vehicle information settings would open here");
        break;
      case "documents":
        Alert.alert("Documents", "Document management would open here");
        break;
      case "earnings":
        Alert.alert("Earnings", "Earnings and payment history would open here");
        break;
      case "notifications":
        Alert.alert("Notifications", "Notification preferences would open here");
        break;
      case "support":
        Alert.alert("Support", "Help and support options would open here");
        break;
    }
  };

  const handleLogout = () => {
    handleHapticFeedback();
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // In a real app, this would clear authentication state
            setIsAuthenticated(false);
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {mockCourierProfile.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockCourierProfile.name}</Text>
            <Text style={styles.profileId}>Courier ID: {mockCourierProfile.id}</Text>
            <Text style={styles.profileEmail}>{mockCourierProfile.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              handleHapticFeedback();
              Alert.alert("Edit Profile", "Profile editing would open here");
            }}
          >
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="cube-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statNumber}>{mockCourierProfile.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Total Deliveries</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="star-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>{mockCourierProfile.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="cash-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>${mockCourierProfile.totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.statNumber}>{mockCourierProfile.joinDate}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={[styles.vehicleIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="car-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleType}>{mockCourierProfile.vehicle.type}</Text>
                <Text style={styles.vehiclePlate}>{mockCourierProfile.vehicle.plate}</Text>
                <Text style={styles.vehicleColor}>{mockCourierProfile.vehicle.color}</Text>
              </View>
              <TouchableOpacity 
                style={styles.vehicleEditButton}
                onPress={() => {
                  handleHapticFeedback();
                  Alert.alert("Edit Vehicle", "Vehicle information editing would open here");
                }}
              >
                <Ionicons name="create-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Document Status */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Document Status</Text>
          <View style={styles.documentsCard}>
            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Ionicons name="card-outline" size={20} color="#3b82f6" />
                <Text style={styles.documentName}>Driver's License</Text>
              </View>
              <View style={[styles.documentStatus, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.documentStatusText, { color: '#10b981' }]}>
                  {mockCourierProfile.documents.license}
                </Text>
              </View>
            </View>

            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#3b82f6" />
                <Text style={styles.documentName}>Insurance</Text>
              </View>
              <View style={[styles.documentStatus, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.documentStatusText, { color: '#10b981' }]}>
                  {mockCourierProfile.documents.insurance}
                </Text>
              </View>
            </View>

            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#3b82f6" />
                <Text style={styles.documentName}>Background Check</Text>
              </View>
              <View style={[styles.documentStatus, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.documentStatusText, { color: '#10b981' }]}>
                  {mockCourierProfile.documents.backgroundCheck}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.optionsList}>
            {mockProfileOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleProfileAction(option.action)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Information */}
        <View style={styles.appInfoSection}>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>App Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Last Updated</Text>
              <Text style={styles.appInfoValue}>January 15, 2025</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Platform</Text>
              <Text style={styles.appInfoValue}>React Native / Expo</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    padding: 8,
  },
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  vehicleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  vehicleColor: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleEditButton: {
    padding: 8,
  },
  documentsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  documentsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  documentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  logoutSection: {
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});
