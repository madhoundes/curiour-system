import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import RNRestart from 'react-native-restart';

// Type definitions
interface Delivery {
  id: string;
  trackingNumber: string;
  customerName: string;
  address: string;
  timeWindow: string;
  estimatedTime: string;
  status: 'ready_for_pickup' | 'in_transit' | 'assigned' | 'delivered';
  packageType: string;
  weight: string;
  specialInstructions: string;
  priority: 'high' | 'medium' | 'low';
}

interface DeliveryCardProps {
  delivery: Delivery;
  activeDeliveryId: string | null;
  onScanPackage: (deliveryId: string) => void;
  onStartRoute: (deliveryId: string) => void;
  onMarkDelivered: (deliveryId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

// Generate 25 remaining deliveries with diverse data
const generateMockDeliveries = (): Delivery[] => {
  const customers = [
    "Sarah Johnson", "Mike Chen", "Lisa Brown", "David Wilson", "Emma Davis",
    "James Smith", "Maria Garcia", "Robert Johnson", "Jennifer Lee", "Michael Brown",
    "Ashley Williams", "Christopher Jones", "Jessica Miller", "Matthew Davis", "Amanda Wilson",
    "Joshua Moore", "Stephanie Taylor", "Andrew Anderson", "Nicole Thomas", "Daniel Jackson",
    "Rachel White", "Kevin Harris", "Michelle Martin", "Ryan Thompson", "Laura Garcia"
  ];

  const addresses = [
    "123 Main Street, Downtown", "456 Oak Avenue, Suburbs", "789 Pine Road, Uptown",
    "321 Elm Street, Midtown", "654 Maple Drive, Westside", "987 Cedar Lane, Eastside",
    "147 Birch Street, Northside", "258 Spruce Avenue, Southside", "369 Willow Way, Central",
    "741 Poplar Place, Riverside", "852 Ash Boulevard, Hillside", "963 Hickory Heights, Valley",
    "159 Sycamore Square, Plaza", "357 Chestnut Circle, Gardens", "468 Walnut Walk, Park",
    "579 Cherry Court, Manor", "680 Apple Avenue, Estate", "791 Orange Orchard, Grove",
    "802 Lemon Lane, Terrace", "913 Grape Grove, Vineyard", "024 Berry Boulevard, Farm",
    "135 Peach Place, Ranch", "246 Plum Parkway, Meadow", "357 Pear Plaza, Field",
    "468 Banana Boulevard, Garden"
  ];

  const packageTypes = ["Standard", "Fragile", "Documents", "Electronics", "Clothing", "Books", "Food"];
  const priorities: ('high' | 'medium' | 'low')[] = ["high", "medium", "low"];
  const statuses: ('ready_for_pickup' | 'in_transit' | 'assigned')[] = ["ready_for_pickup", "in_transit", "assigned"];
  const specialInstructions = [
    "Call upon arrival", "Handle with care - electronics", "Signature required", "Leave at door",
    "Ring doorbell twice", "Call before delivery", "Leave with neighbor", "No signature required",
    "Fragile - handle carefully", "Deliver to back door", "Call upon arrival - elderly resident",
    "Leave in mailbox", "Deliver to front desk", "Call if no answer", "Special handling required"
  ];

  return Array.from({ length: 25 }, (_, index) => {
    const customerIndex = index % customers.length;
    const addressIndex = index % addresses.length;
    const packageType = packageTypes[index % packageTypes.length];
    const priority = priorities[index % priorities.length];
    const status = statuses[index % statuses.length];
    const specialInstruction = specialInstructions[index % specialInstructions.length];
    
    const hour = 8 + (index % 12); // 8 AM to 7 PM
    const minute = (index * 15) % 60; // 15-minute intervals
    const timeWindow = `${hour}:${minute.toString().padStart(2, '0')} PM - ${hour + 2}:${minute.toString().padStart(2, '0')} PM`;
    const estimatedTime = `${hour + 1}:${(minute + 15).toString().padStart(2, '0')} PM`;
    
    return {
      id: `PCG-DEL-${(index + 1).toString().padStart(3, '0')}`,
      trackingNumber: `PCG789123${(456 + index).toString().padStart(3, '0')}`,
      customerName: customers[customerIndex],
      address: addresses[addressIndex],
      timeWindow,
      estimatedTime,
      status,
      packageType,
      weight: `${(0.5 + (index * 0.3) % 5).toFixed(1)} kg`,
      specialInstructions: specialInstruction,
      priority
    };
  });
};

// Mock data for deliveries
const mockDeliveries = generateMockDeliveries();

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

// Memoized delivery card component for performance
const DeliveryCard = React.memo(({ delivery, activeDeliveryId, onScanPackage, onStartRoute, onMarkDelivered, getStatusColor, getStatusText, getPriorityColor }: DeliveryCardProps) => {
  const isActive = delivery.id === activeDeliveryId;
  const isDelivered = delivery.status === 'delivered';

  return (
    <View style={[
      styles.deliveryCard,
      (!isDelivered && !isActive) ? { opacity: 0.6 } : null
    ]}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryCustomer}>{delivery.customerName}</Text>
          <Text style={styles.trackingNumber}>{delivery.trackingNumber}</Text>
          <View style={styles.deliveryBadges}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(delivery.status) },
              isDelivered && styles.statusBadgeDelivered
            ]}>
              <View style={styles.statusBadgeContent}>
                {isDelivered && (
                  <Ionicons name="checkmark-circle" size={14} color="white" style={{ marginRight: 4 }} />
                )}
                <Text style={[
                  styles.statusBadgeText,
                  isDelivered && styles.statusBadgeTextDelivered
                ]}>
                  {getStatusText(delivery.status)}
                </Text>
              </View>
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
        {isDelivered ? (
          <View style={styles.deliveredStatus}>
            <View style={styles.deliveredIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            </View>
            <View style={styles.deliveredTextContainer}>
              <Text style={styles.deliveredTextMain}>✓ DELIVERED</Text>
              <Text style={styles.deliveredTextSub}>Successfully completed</Text>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.deliveryActionButton,
                isActive ? undefined : styles.deliveryActionButtonDisabled
              ]}
              onPress={() => onScanPackage(delivery.id)}
              activeOpacity={0.7}
              disabled={!isActive}
            >
              <Ionicons name="camera-outline" size={16} color={isActive ? '#3b82f6' : '#9ca3af'} />
              <Text style={[
                styles.deliveryActionButtonText,
                !isActive ? { color: '#9ca3af' } : null
              ]}>Scan Package</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryActionButton,
                isActive ? styles.deliveryActionButtonPrimary : styles.deliveryActionButtonDisabled
              ]}
              onPress={() => onStartRoute(delivery.id)}
              activeOpacity={0.8}
              disabled={!isActive}
            >
              <Ionicons name="map-outline" size={16} color={isActive ? 'white' : '#9ca3af'} />
              <Text style={[
                styles.deliveryActionButtonText,
                isActive ? { color: 'white' } : { color: '#9ca3af' }
              ]}>Start Route</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryActionButton,
                isActive ? styles.deliveryActionButtonSuccess : styles.deliveryActionButtonDisabled
              ]}
              onPress={() => onMarkDelivered(delivery.id)}
              activeOpacity={0.8}
              disabled={!isActive}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={isActive ? 'white' : '#9ca3af'} />
              <Text style={[
                styles.deliveryActionButtonText,
                isActive ? { color: 'white' } : { color: '#9ca3af' }
              ]}>Mark as Delivered</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

export default function DeliveriesScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [deliveries, setDeliveries] = useState(() => [...mockDeliveries]);
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  
  // Calculate counts based on current deliveries state
  const completed = useMemo(() => deliveries.filter(d => d.status === 'delivered').length, [deliveries]);
  const remaining = useMemo(() => deliveries.filter(d => d.status !== 'delivered').length, [deliveries]);
  
  const activeDeliveryId = useMemo(() => {
    const pending = deliveries.filter(d => d.status !== 'delivered');
    if (pending.length === 0) return null;
    const next = [...pending].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])[0];
    return next.id;
  }, [deliveries]);
  
  const sortedDeliveries = useMemo(() => {
    const list = [...deliveries].sort((a, b) => {
      const aDelivered = a.status === 'delivered' ? 1 : 0;
      const bDelivered = b.status === 'delivered' ? 1 : 0;
      if (aDelivered !== bDelivered) return aDelivered - bDelivered; // delivered last
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    if (activeDeliveryId) {
      const idx = list.findIndex(d => d.id === activeDeliveryId);
      if (idx > 0) {
        const [active] = list.splice(idx, 1);
        list.unshift(active);
      }
    }
    return list;
  }, [deliveries, activeDeliveryId]);

  const handleHapticFeedback = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleScanPackage = useCallback((deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Scan Package", `Scanning package for delivery ${deliveryId}`);
  }, [handleHapticFeedback]);

  const handleStartRoute = useCallback((deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Start Route", `Starting route for delivery ${deliveryId}`);
  }, [handleHapticFeedback]);

  const handleMarkDelivered = useCallback((deliveryId: string) => {
    handleHapticFeedback();
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'delivered' } : d));
    Alert.alert("Delivered", `Delivery ${deliveryId} marked as delivered.`);
  }, [handleHapticFeedback]);

  const handleReloadApp = useCallback(() => {
    handleHapticFeedback();
    Alert.alert(
      "Reload App",
      "This will restart the app to refresh all data and clear caches. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reload", 
          style: "destructive",
          onPress: () => {
            try {
              RNRestart.restart();
            } catch (error) {
              console.error('Failed to restart app:', error);
              Alert.alert("Error", "Failed to restart app. Please restart manually.");
            }
          }
        }
      ]
    );
  }, [handleHapticFeedback]);

  const handleClearCache = useCallback(() => {
    handleHapticFeedback();
    Alert.alert(
      "Clear Cache",
      "This will clear all caches and reload the app. This may take a moment. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear & Reload", 
          style: "destructive",
          onPress: () => {
            // Clear app state
            setDeliveries(() => [...mockDeliveries]);
            setSelectedFilter('all');
            
            // Show loading message
            Alert.alert(
              "Cache Cleared", 
              "App cache has been cleared. The app will now reload with fresh data.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    try {
                      RNRestart.restart();
                    } catch (error) {
                      console.error('Failed to restart app:', error);
                      Alert.alert("Error", "Cache cleared but failed to restart. Please restart manually.");
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }, [handleHapticFeedback]);

  const filteredDeliveries = useMemo(() => {
    return sortedDeliveries.filter(delivery => {
      if (selectedFilter === 'all') return true;
      return delivery.status === selectedFilter;
    });
  }, [sortedDeliveries, selectedFilter]);

  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All', count: deliveries.length },
    { key: 'ready_for_pickup', label: 'Ready', count: deliveries.filter(d => d.status === 'ready_for_pickup').length },
    { key: 'in_transit', label: 'In Transit', count: deliveries.filter(d => d.status === 'in_transit').length },
    { key: 'assigned', label: 'Assigned', count: deliveries.filter(d => d.status === 'assigned').length },
    { key: 'delivered', label: 'Delivered', count: deliveries.filter(d => d.status === 'delivered').length },
  ], [deliveries]);

  // Optimized renderItem function
  const renderItem = useCallback(({ item }: { item: Delivery }) => (
    <DeliveryCard
      delivery={item}
      activeDeliveryId={activeDeliveryId}
      onScanPackage={handleScanPackage}
      onStartRoute={handleStartRoute}
      onMarkDelivered={handleMarkDelivered}
      getStatusColor={getStatusColor}
      getStatusText={getStatusText}
      getPriorityColor={getPriorityColor}
    />
  ), [activeDeliveryId, handleScanPackage, handleStartRoute, handleMarkDelivered]);

  const keyExtractor = useCallback((item: Delivery) => item.id, []);

  // Get item layout for performance optimization
  const getItemLayout = useCallback((data: ArrayLike<Delivery> | null | undefined, index: number) => ({
    length: 200, // Approximate height of each delivery card
    offset: 200 * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Today's Deliveries</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{remaining} remaining</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, styles.headerButtonSecondary]}
            onPress={handleReloadApp}
          >
            <Ionicons name="refresh-outline" size={18} color="#6b7280" />
            <Text style={[styles.headerButtonText, styles.headerButtonTextSecondary]}>Reload</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, styles.headerButtonSecondary]}
            onPress={handleClearCache}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.headerButtonText, styles.headerButtonTextDanger]}>Clear</Text>
          </TouchableOpacity>
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
      <FlatList
        data={filteredDeliveries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.deliveriesContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
        ListEmptyComponent={() => (
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
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  headerBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonSecondary: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 4,
  },
  headerButtonTextSecondary: {
    color: '#6b7280',
    fontSize: 12,
  },
  headerButtonTextDanger: {
    color: '#ef4444',
    fontSize: 12,
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
    paddingBottom: 40,
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
  statusBadgeDelivered: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#059669',
  },
  statusBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeTextDelivered: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  deliveredIconContainer: {
    marginRight: 8,
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 4,
  },
  deliveredTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  deliveredTextMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  deliveredTextSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginTop: 2,
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
