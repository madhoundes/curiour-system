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
import * as Haptics from 'expo-haptics';

// Mock data for deliveries
const mockDeliveries = [
  {
    id: "PCG-DEL-001",
    trackingNumber: "PCG789123456",
    customerName: "Sarah Johnson",
    address: "123 Main Street, Downtown",
    timeWindow: "2:00 PM - 4:00 PM",
    estimatedTime: "2:30 PM",
    status: "ready_for_pickup",
    packageType: "Standard",
    weight: "2.5 kg",
    specialInstructions: "Call upon arrival",
    priority: "high"
  },
  {
    id: "PCG-DEL-002",
    trackingNumber: "PCG789123457",
    customerName: "Mike Chen",
    address: "456 Oak Avenue, Suburbs",
    timeWindow: "3:00 PM - 5:00 PM",
    estimatedTime: "3:15 PM",
    status: "in_transit",
    packageType: "Fragile",
    weight: "1.2 kg",
    specialInstructions: "Handle with care - electronics",
    priority: "medium"
  },
  {
    id: "PCG-DEL-003",
    trackingNumber: "PCG789123458",
    customerName: "Lisa Brown",
    address: "789 Pine Road, Uptown",
    timeWindow: "4:00 PM - 6:00 PM",
    estimatedTime: "4:45 PM",
    status: "assigned",
    packageType: "Documents",
    weight: "0.3 kg",
    specialInstructions: "Signature required",
    priority: "low"
  },
  {
    id: "PCG-DEL-004",
    trackingNumber: "PCG789123459",
    customerName: "David Wilson",
    address: "321 Elm Street, Midtown",
    timeWindow: "5:00 PM - 7:00 PM",
    estimatedTime: "5:30 PM",
    status: "delivered",
    packageType: "Standard",
    weight: "1.8 kg",
    specialInstructions: "Leave at door",
    priority: "medium"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "#3b82f6";
    case "in_transit":
      return "#f59e0b";
    case "delivered":
      return "#10b981";
    case "assigned":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "Ready for Pickup";
    case "in_transit":
      return "In Transit";
    case "delivered":
      return "Delivered";
    case "assigned":
      return "Assigned";
    default:
      return "Unknown";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

export default function DeliveriesScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleScanPackage = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Scan Package", `Scanning package for delivery ${deliveryId}`);
  };

  const handleStartRoute = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Start Route", `Starting route for delivery ${deliveryId}`);
  };

  const handleMarkDelivered = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Mark Delivered", `Marking delivery ${deliveryId} as delivered`);
  };

  const filteredDeliveries = mockDeliveries.filter(delivery => {
    if (selectedFilter === 'all') return true;
    return delivery.status === selectedFilter;
  });

  const filterOptions = [
    { key: 'all', label: 'All', count: mockDeliveries.length },
    { key: 'ready_for_pickup', label: 'Ready', count: mockDeliveries.filter(d => d.status === 'ready_for_pickup').length },
    { key: 'in_transit', label: 'In Transit', count: mockDeliveries.filter(d => d.status === 'in_transit').length },
    { key: 'delivered', label: 'Delivered', count: mockDeliveries.filter(d => d.status === 'delivered').length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Deliveries</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              handleHapticFeedback();
              Alert.alert("Route Optimization", "Optimizing delivery route...");
            }}
          >
            <Ionicons name="map-outline" size={20} color="#3b82f6" />
            <Text style={styles.headerButtonText}>Route</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.key && styles.filterTabActive
                ]}
                onPress={() => {
                  handleHapticFeedback();
                  setSelectedFilter(filter.key);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterBadge,
                  selectedFilter === filter.key && styles.filterBadgeActive
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    selectedFilter === filter.key && styles.filterBadgeTextActive
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Deliveries List */}
        <View style={styles.deliveriesContainer}>
          {filteredDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryCustomer}>{delivery.customerName}</Text>
                  <Text style={styles.trackingNumber}>{delivery.trackingNumber}</Text>
                  <View style={styles.deliveryBadges}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                      <Text style={styles.statusBadgeText}>{getStatusText(delivery.status)}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(delivery.priority) }]}>
                      <Text style={styles.priorityBadgeText}>{delivery.priority}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.deliveryStatusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(delivery.status) }]} />
                </View>
              </View>
              
              <View style={styles.deliveryDetails}>
                <View style={styles.deliveryDetailRow}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.deliveryDetailText}>{delivery.address}</Text>
                </View>
                <View style={styles.deliveryDetailRow}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.deliveryDetailText}>
                    {delivery.timeWindow} (Est: {delivery.estimatedTime})
                  </Text>
                </View>
                <View style={styles.deliveryMeta}>
                  <View style={styles.deliveryMetaItem}>
                    <Ionicons name="cube-outline" size={12} color="#6b7280" />
                    <Text style={styles.deliveryMetaText}>{delivery.packageType}</Text>
                  </View>
                  <View style={styles.deliveryMetaItem}>
                    <Ionicons name="scale-outline" size={12} color="#6b7280" />
                    <Text style={styles.deliveryMetaText}>{delivery.weight}</Text>
                  </View>
                </View>
              </View>

              {delivery.specialInstructions && (
                <View style={styles.specialInstructions}>
                  <Ionicons name="information-circle-outline" size={12} color="#3b82f6" />
                  <Text style={styles.specialInstructionsText}>
                    <Text style={styles.specialInstructionsLabel}>Special Instructions: </Text>
                    {delivery.specialInstructions}
                  </Text>
                </View>
              )}

              <View style={styles.deliveryActions}>
                {delivery.status === "ready_for_pickup" && (
                  <>
                    <TouchableOpacity
                      style={styles.deliveryActionButton}
                      onPress={() => handleScanPackage(delivery.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera-outline" size={16} color="#3b82f6" />
                      <Text style={styles.deliveryActionButtonText}>Scan Package</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deliveryActionButton, styles.deliveryActionButtonPrimary]}
                      onPress={() => handleStartRoute(delivery.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map-outline" size={16} color="white" />
                      <Text style={[styles.deliveryActionButtonText, { color: 'white' }]}>Start Route</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {delivery.status === "in_transit" && (
                  <TouchableOpacity
                    style={[styles.deliveryActionButton, styles.deliveryActionButtonSuccess]}
                    onPress={() => handleMarkDelivered(delivery.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                    <Text style={[styles.deliveryActionButtonText, { color: 'white' }]}>Mark as Delivered</Text>
                  </TouchableOpacity>
                )}
                
                {delivery.status === "assigned" && (
                  <TouchableOpacity
                    style={[styles.deliveryActionButton, styles.deliveryActionButtonDisabled]}
                    disabled
                  >
                    <Ionicons name="time-outline" size={16} color="#9ca3af" />
                    <Text style={[styles.deliveryActionButtonText, { color: '#9ca3af' }]}>Waiting for Pickup</Text>
                  </TouchableOpacity>
                )}

                {delivery.status === "delivered" && (
                  <View style={styles.deliveredStatus}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.deliveredText}>Delivered Successfully</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredDeliveries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No deliveries found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? "You don't have any deliveries today" 
                : `No deliveries with status "${selectedFilter}"`
              }
            </Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: 'white',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBadgeTextActive: {
    color: 'white',
  },
  deliveriesContainer: {
    padding: 20,
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  deliveryBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryStatusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deliveryDetails: {
    marginBottom: 12,
  },
  deliveryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  deliveryMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  deliveryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialInstructionsText: {
    fontSize: 12,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
  },
  specialInstructionsLabel: {
    fontWeight: '600',
  },
  deliveryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deliveryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  deliveryActionButtonPrimary: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  deliveryActionButtonSuccess: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  deliveryActionButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  deliveryActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#6b7280',
  },
  deliveredStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  deliveredText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
