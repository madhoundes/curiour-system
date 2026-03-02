# Notification Functionality Test Guide

## Overview
This document outlines how to test the newly implemented notification functionality in the courier dashboard.

## Test Cases

### 1. Mark All Read Functionality
**Steps:**
1. Navigate to `/courier` page
2. Click the notification bell icon to open the modal
3. Verify there are unread notifications (blue dots and "2 new" badge)
4. Click "Mark All Read" button
5. **Expected Results:**
   - All blue unread indicators should disappear
   - Notification items should no longer have blue left border
   - Text should change from bold to normal weight
   - "Mark All Read" button should become disabled
   - Console should log "All notifications marked as read"
   - Notification badge in header should disappear

### 2. Clear All Functionality
**Steps:**
1. Open the notification modal
2. Click "Clear All" button
3. **Expected Results:**
   - All notifications should be removed from the list
   - Empty state should appear with "No notifications" message
   - Footer with action buttons should disappear
   - Console should log "All notifications cleared"
   - Notification badge in header should disappear

### 3. Individual Notification Click
**Steps:**
1. Open the notification modal
2. Click on any unread notification
3. **Expected Results:**
   - That specific notification should be marked as read
   - Blue dot should disappear from that notification
   - Blue left border should be removed
   - Text should change from bold to normal weight
   - Unread count should decrease

### 4. State Persistence
**Steps:**
1. Mark some notifications as read
2. Close and reopen the modal
3. **Expected Results:**
   - Previously read notifications should remain read
   - Unread count should reflect the current state

## Technical Implementation Details

### State Management
- Uses React `useState` with `notifications` state array
- Initialized with `mockNotifications` data
- State updates use functional updates for immutability

### Key Functions
- `handleMarkAllRead()`: Maps through notifications and sets all unread to read
- `handleClearAll()`: Sets notifications array to empty array
- `handleNotificationItemClick()`: Marks individual notification as read

### Visual Feedback
- "Mark All Read" button is disabled when no unread notifications exist
- Unread notifications have blue left border and bold text
- Blue dots indicate unread status
- Empty state shows when no notifications exist

## Browser Console Testing
Open browser dev tools and check console for:
- "All notifications marked as read" when clicking Mark All Read
- "All notifications cleared" when clicking Clear All
- Individual notification click logs (existing functionality)

## Accessibility Testing
- All buttons have proper ARIA labels
- Keyboard navigation works with Tab/Enter/Space
- Screen reader should announce state changes
- Focus management is maintained during state updates
