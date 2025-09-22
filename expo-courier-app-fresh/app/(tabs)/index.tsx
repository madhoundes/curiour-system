import React, { useState, useEffect } from 'react';
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

// Mock data for courier dashboard
const mockCourierData = {
  name: "Ahmed Hassan",
  id: "PCG-C001",
  stats: {
    deliveriesToday: 8,
    completed: 5,
    remaining: 3,
    earnings: 145.50,
    efficiency: 92,
    onTimeRate: 98,
    customerRating: 4.8
  }
};

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
  }
];

const mockQuickActions = [
  {
    id: "scan",
    title: "Scan Package",
    description: "Scan barcode to confirm pickup",
    icon: "camera" as keyof typeof Ionicons.glyphMap,
    color: "#3b82f6",
    action: "scan"
  },
  {
    id: "route",
    title: "View Route",
    description: "See optimized delivery route",
    icon: "map" as keyof typeof Ionicons.glyphMap,
    color: "#10b981",
    action: "route"
  },
  {
    id: "proof",
    title: "Upload Proof",
    description: "Submit delivery confirmation",
    icon: "camera" as keyof typeof Ionicons.glyphMap,
    color: "#8b5cf6",
    action: "proof"
  },
  {
    id: "support",
    title: "Get Help",
    description: "Contact support team",
    icon: "help-circle" as keyof typeof Ionicons.glyphMap,
    color: "#f59e0b",
    action: "support"
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

export default function CourierDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      // Mock authentication check - in real app, this would check AsyncStorage or secure storage
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleQuickAction = (action: string) => {
    handleHapticFeedback();
    
    switch (action) {
      case "scan":
        Alert.alert("Scan Package", "Camera will open to scan barcode");
        break;
      case "route":
        router.push('/deliveries');
        break;
      case "proof":
        Alert.alert("Upload Proof", "Camera will open to take delivery photo");
        break;
      case "support":
        Alert.alert("Support", "Contacting support team...");
        break;
    }
  };

  const handleStartRoute = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Start Route", `Starting route for delivery ${deliveryId}`);
  };

  const handleScanPackage = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Scan Package", `Scanning package for delivery ${deliveryId}`);
  };

  const handleMarkDelivered = (deliveryId: string) => {
    handleHapticFeedback();
    Alert.alert("Mark Delivered", `Marking delivery ${deliveryId} as delivered`);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="refresh" size={32} color="#3b82f6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {mockCourierData.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>
                Welcome back, {mockCourierData.name}
              </Text>
              <Text style={styles.courierIdText}>
                Courier ID: {mockCourierData.id}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              handleHapticFeedback();
              Alert.alert("Notifications", "No new notifications");
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cube-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statNumber}>{mockCourierData.stats.deliveriesToday}</Text>
              <Text style={styles.statLabel}>Total Deliveries</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>{mockCourierData.stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={12} color="#10b981" />
                <Text style={styles.trendText}>On track</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="cash-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>${mockCourierData.stats.earnings}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={12} color="#f59e0b" />
                <Text style={styles.trendText}>+$12.50</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="trending-up-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.statNumber}>{mockCourierData.stats.efficiency}%</Text>
              <Text style={styles.statLabel}>Efficiency</Text>
              <View style={styles.statTrend}>
                <Ionicons name="target" size={12} color="#8b5cf6" />
                <Text style={styles.trendText}>Target: 90%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {mockQuickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action.action)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Delivery */}
        <View style={styles.nextDeliverySection}>
          <View style={styles.nextDeliveryCard}>
            <View style={styles.nextDeliveryHeader}>
              <Ionicons name="navigate-outline" size={20} color="#3b82f6" />
              <Text style={styles.nextDeliveryTitle}>Ready for Next Delivery?</Text>
            </View>
            <Text style={styles.nextDeliveryDescription}>
              Start your next assigned delivery route
            </Text>
            <View style={styles.nextDeliveryContent}>
              <View style={styles.nextDeliveryInfo}>
                <View style={styles.nextDeliveryIcon}>
                  <Ionicons name="cube-outline" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.nextDeliveryCustomer}>
                    Next: {mockDeliveries[0]?.customerName}
                  </Text>
                  <Text style={styles.nextDeliveryAddress}>
                    {mockDeliveries[0]?.address}
                  </Text>
                  <View style={styles.nextDeliveryTime}>
                    <Ionicons name="time-outline" size={12} color="#3b82f6" />
                    <Text style={styles.nextDeliveryTimeText}>
                      {mockDeliveries[0]?.timeWindow}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.startRouteButton}
                onPress={() => handleStartRoute(mockDeliveries[0]?.id || '')}
                activeOpacity={0.8}
              >
                <Ionicons name="map-outline" size={16} color="white" />
                <Text style={styles.startRouteButtonText}>Start Route</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.deliveriesSection}>
          <View style={styles.deliveriesHeader}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <TouchableOpacity onPress={() => router.push('/deliveries')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {mockDeliveries.slice(0, 2).map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryCustomer}>{delivery.customerName}</Text>
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
              </View>
            </View>
          ))}
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={[styles.performanceIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="time-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.performanceNumber}>{mockCourierData.stats.onTimeRate}%</Text>
              <Text style={styles.performanceLabel}>On-Time Rate</Text>
              <View style={styles.performanceTrend}>
                <Ionicons name="trending-up" size={12} color="#10b981" />
                <Text style={styles.performanceTrendText}>+2% this week</Text>
              </View>
            </View>

            <View style={styles.performanceCard}>
              <View style={[styles.performanceIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="star-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.performanceNumber}>{mockCourierData.stats.customerRating}</Text>
              <Text style={styles.performanceLabel}>Customer Rating</Text>
              <View style={styles.performanceTrend}>
                <Ionicons name="trending-up" size={12} color="#f59e0b" />
                <Text style={styles.performanceTrendText}>Excellent feedback</Text>
              </View>
            </View>

            <View style={styles.performanceCard}>
              <View style={[styles.performanceIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="trending-up-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.performanceNumber}>{mockCourierData.stats.remaining}</Text>
              <Text style={styles.performanceLabel}>Remaining Today</Text>
              <View style={styles.performanceTrend}>
                <Ionicons name="target" size={12} color="#8b5cf6" />
                <Text style={styles.performanceTrendText}>On track for target</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tip */}
        <View style={styles.tipSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Today's Tip</Text>
              <Text style={styles.tipText}>
                Remember to scan packages before pickup and take photos for proof of delivery. 
                This helps maintain accurate tracking and customer satisfaction.
              </Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  courierIdText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notificationButton: {
    padding: 8,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  nextDeliverySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nextDeliveryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nextDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextDeliveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  nextDeliveryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  nextDeliveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextDeliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nextDeliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextDeliveryCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  nextDeliveryAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  nextDeliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDeliveryTimeText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 4,
    fontWeight: '500',
  },
  startRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startRouteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deliveriesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  deliveriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
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
  performanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
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
  performanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  performanceTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceTrendText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  tipSection: {
    paddingHorizontal: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
