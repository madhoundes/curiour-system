import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Mock performance data
const mockPerformanceData = {
  today: {
    deliveries: 8,
    completed: 5,
    onTime: 4,
    efficiency: 92,
    earnings: 145.50,
    rating: 4.8
  },
  thisWeek: {
    deliveries: 42,
    completed: 38,
    onTime: 35,
    efficiency: 89,
    earnings: 756.30,
    rating: 4.7
  },
  thisMonth: {
    deliveries: 156,
    completed: 142,
    onTime: 128,
    efficiency: 87,
    earnings: 2847.60,
    rating: 4.6
  }
};

const mockAchievements = [
  {
    id: 1,
    title: "Speed Demon",
    description: "Complete 10 deliveries in under 30 minutes each",
    icon: "flash" as keyof typeof Ionicons.glyphMap,
    color: "#f59e0b",
    progress: 7,
    target: 10,
    unlocked: false
  },
  {
    id: 2,
    title: "Perfect Week",
    description: "Maintain 100% on-time delivery rate for a week",
    icon: "trophy" as keyof typeof Ionicons.glyphMap,
    color: "#10b981",
    progress: 5,
    target: 7,
    unlocked: false
  },
  {
    id: 3,
    title: "Customer Favorite",
    description: "Achieve 5.0 rating for 20 consecutive deliveries",
    icon: "star" as keyof typeof Ionicons.glyphMap,
    color: "#8b5cf6",
    progress: 12,
    target: 20,
    unlocked: false
  },
  {
    id: 4,
    title: "Efficiency Master",
    description: "Maintain 95% efficiency for 30 days",
    icon: "speedometer" as keyof typeof Ionicons.glyphMap,
    color: "#3b82f6",
    progress: 15,
    target: 30,
    unlocked: false
  }
];

export default function PerformanceScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'today':
        return mockPerformanceData.today;
      case 'week':
        return mockPerformanceData.thisWeek;
      case 'month':
        return mockPerformanceData.thisMonth;
      default:
        return mockPerformanceData.today;
    }
  };

  const currentData = getCurrentData();

  const periodOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
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
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              handleHapticFeedback();
              // Export performance data
            }}
          >
            <Ionicons name="download-outline" size={20} color="#3b82f6" />
            <Text style={styles.headerButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => {
                handleHapticFeedback();
                setSelectedPeriod(period.key);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="cube-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.overviewNumber}>{currentData.deliveries}</Text>
              <Text style={styles.overviewLabel}>Total Deliveries</Text>
              <View style={styles.overviewProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentData.completed / currentData.deliveries) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentData.completed}/{currentData.deliveries} completed
                </Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.overviewNumber}>{currentData.onTime}</Text>
              <Text style={styles.overviewLabel}>On-Time Deliveries</Text>
              <View style={styles.overviewTrend}>
                <Ionicons name="trending-up" size={16} color="#10b981" />
                <Text style={styles.trendText}>
                  {Math.round((currentData.onTime / currentData.deliveries) * 100)}% rate
                </Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="cash-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.overviewNumber}>${currentData.earnings}</Text>
              <Text style={styles.overviewLabel}>Total Earnings</Text>
              <View style={styles.overviewTrend}>
                <Ionicons name="trending-up" size={16} color="#f59e0b" />
                <Text style={styles.trendText}>
                  ${(currentData.earnings / currentData.deliveries).toFixed(2)} avg
                </Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="star-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.overviewNumber}>{currentData.rating}</Text>
              <Text style={styles.overviewLabel}>Customer Rating</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(currentData.rating) ? "star" : "star-outline"}
                    size={12}
                    color="#f59e0b"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Efficiency Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Efficiency Metrics</Text>
          <View style={styles.metricsCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Overall Efficiency</Text>
                <Text style={styles.metricDescription}>Based on delivery time and accuracy</Text>
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.metricNumber}>{currentData.efficiency}%</Text>
                <View style={styles.efficiencyBar}>
                  <View 
                    style={[
                      styles.efficiencyFill, 
                      { 
                        width: `${currentData.efficiency}%`,
                        backgroundColor: currentData.efficiency >= 90 ? '#10b981' : 
                                       currentData.efficiency >= 80 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Completion Rate</Text>
                <Text style={styles.metricDescription}>Deliveries completed vs assigned</Text>
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.metricNumber}>
                  {Math.round((currentData.completed / currentData.deliveries) * 100)}%
                </Text>
                <View style={styles.efficiencyBar}>
                  <View 
                    style={[
                      styles.efficiencyFill, 
                      { 
                        width: `${(currentData.completed / currentData.deliveries) * 100}%`,
                        backgroundColor: '#3b82f6'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>On-Time Rate</Text>
                <Text style={styles.metricDescription}>Deliveries completed within time window</Text>
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.metricNumber}>
                  {Math.round((currentData.onTime / currentData.deliveries) * 100)}%
                </Text>
                <View style={styles.efficiencyBar}>
                  <View 
                    style={[
                      styles.efficiencyFill, 
                      { 
                        width: `${(currentData.onTime / currentData.deliveries) * 100}%`,
                        backgroundColor: '#10b981'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {mockAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                  <Ionicons name={achievement.icon} size={24} color="white" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${(achievement.progress / achievement.target) * 100}%`,
                            backgroundColor: achievement.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress}/{achievement.target}
                    </Text>
                  </View>
                </View>
                <View style={styles.achievementStatus}>
                  {achievement.unlocked ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : (
                    <Ionicons name="lock-closed" size={24} color="#d1d5db" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Performance Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
              </View>
              <Text style={styles.tipText}>
                Plan your route before starting deliveries to minimize travel time
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="time-outline" size={16} color="#3b82f6" />
              </View>
              <Text style={styles.tipText}>
                Leave 5-10 minutes early for each delivery to account for traffic
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="chatbubble-outline" size={16} color="#10b981" />
              </View>
              <Text style={styles.tipText}>
                Communicate with customers about delivery updates for better ratings
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
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
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  overviewProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  overviewTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  efficiencyBar: {
    width: 80,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
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
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementStatus: {
    marginLeft: 12,
  },
  tipsSection: {
    paddingHorizontal: 20,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
