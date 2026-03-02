# Driver API Endpoints Documentation

This document provides comprehensive documentation for the driver-specific API endpoints that have been added to the Parcego courier platform.

## Overview

The driver API service provides six main endpoints for driver operations:

1. **Search Shipments** - Search for assigned shipments by tracking code or ID
2. **Get Shipment Details** - Retrieve detailed information about a specific shipment
3. **Update Shipment Status** - Update the status of a shipment during delivery
4. **Get Today's Assignments** - Get all assignments for the current driver for today
5. **Get Assignments by Date** - Get all assignments for a specific date
6. **Upload Delivery Photo** - Upload a photo confirming package delivery

## Installation & Import

```typescript
import { driverService } from '@/lib/api';
// or
import { driverService } from '@/lib/api/driver';
```

---

## Endpoints

### 1. Search Assigned Shipments

**Endpoint:** `GET /driver/shipments/search`

Search for shipments assigned to the current driver using tracking code or shipment ID.

#### Parameters

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| `q`       | string | Yes      | Search query (tracking code or ID)    |

**Constraints:**
- Min length: 1 character
- Max length: 50 characters

#### Usage Example

```typescript
try {
  const results = await driverService.searchShipments('PCG123456789');
  
  console.log(`Found ${results.total} shipments`);
  console.log(`Search query: ${results.query}`);
  
  results.shipments.forEach(shipment => {
    console.log(`Tracking: ${shipment.tracking_code}`);
    console.log(`Status: ${shipment.status}`);
    console.log(`Receiver: ${shipment.receiver_name}`);
  });
} catch (error) {
  console.error('Search failed:', error.message);
}
```

#### Response Structure

```typescript
interface DriverSearchShipmentsResponse {
  query: string;
  shipments: DriverShipment[];
  total: number;
}

interface DriverShipment {
  id: number;
  tracking_code: string;
  status: string;
  sender_name: string;
  sender_company?: string;
  sender_address: string;
  sender_city: string;
  sender_province: string;
  sender_postal_code: string;
  receiver_name: string;
  receiver_company?: string;
  receiver_address: string;
  receiver_city: string;
  receiver_province: string;
  receiver_postal_code: string;
  package_type: string;
  weight: number;
  special_instructions?: string;
  delivery_notes?: string;
  estimated_delivery_date?: string;
  created_at: string;
}
```

#### Example Response

```json
{
  "query": "PCG123456789",
  "shipments": [
    {
      "id": 1,
      "tracking_code": "ABC123",
      "status": "in_transit",
      "sender_name": "John Doe",
      "sender_company": "ABC Corp",
      "sender_address": "123 Main St",
      "sender_city": "Toronto",
      "sender_province": "Ontario",
      "sender_postal_code": "M5V2A8",
      "receiver_name": "Jane Smith",
      "receiver_address": "456 Oak Ave",
      "receiver_city": "Toronto",
      "receiver_province": "Ontario",
      "receiver_postal_code": "M5H2N2",
      "package_type": "box",
      "weight": 2.5,
      "delivery_notes": "Leave at front door",
      "special_instructions": "Handle with care",
      "estimated_delivery_date": "2024-01-15T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### Error Responses

| Status Code | Description                          |
|-------------|--------------------------------------|
| 401         | Authentication required              |
| 403         | Driver role required                 |
| 422         | Validation error (invalid query)     |

---

### 2. Get Shipment Details by ID

**Endpoint:** `GET /driver/shipments/search/{shipment_id}`

Get detailed shipment information by shipment ID for the driver dashboard.

#### Parameters

| Parameter     | Type    | Required | Description          |
|---------------|---------|----------|----------------------|
| `shipment_id` | integer | Yes      | Shipment ID (path)   |

#### Usage Example

```typescript
try {
  const shipmentId = 123;
  const shipment = await driverService.getShipmentById(shipmentId);
  
  console.log(`Tracking Code: ${shipment.tracking_code}`);
  console.log(`Status: ${shipment.status}`);
  console.log(`Delivery Address: ${shipment.receiver_address}`);
  console.log(`Special Instructions: ${shipment.special_instructions || 'None'}`);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Shipment does not exist or is not assigned to you');
  } else {
    console.error('Failed to get shipment:', error.message);
  }
}
```

#### Response Structure

The response is a single `DriverShipment` object (same structure as in search results).

#### Example Response

```json
{
  "id": 123,
  "tracking_code": "PCG123456789",
  "status": "in_transit",
  "sender_name": "John Doe",
  "sender_company": "ABC Corp",
  "sender_address": "123 Main St",
  "sender_city": "Toronto",
  "sender_province": "Ontario",
  "sender_postal_code": "M5V2A8",
  "receiver_name": "Jane Smith",
  "receiver_company": "XYZ Ltd",
  "receiver_address": "456 Oak Ave",
  "receiver_city": "Toronto",
  "receiver_province": "Ontario",
  "receiver_postal_code": "M5H2N2",
  "package_type": "box",
  "weight": 2.5,
  "special_instructions": "Handle with care",
  "delivery_notes": "Leave at front door",
  "estimated_delivery_date": "2024-01-15T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Error Responses

| Status Code | Description                          |
|-------------|--------------------------------------|
| 401         | Authentication required              |
| 403         | Driver role required                 |
| 404         | Shipment not found                   |
| 422         | Validation error (invalid ID)        |

---

### 3. Update Shipment Status

**Endpoint:** `PUT /driver/shipments/{shipment_id}/status`

Update the status of a shipment. Drivers can move shipments through different stages like from 'in_warehouse' to 'in_transit'.

#### Parameters

| Parameter     | Type    | Required | Description          |
|---------------|---------|----------|----------------------|
| `shipment_id` | integer | Yes      | Shipment ID (path)   |

#### Request Body

```typescript
interface DriverUpdateShipmentStatusRequest {
  status: string;    // New status (required)
  notes?: string;    // Optional notes (max 1000 chars)
}
```

#### Valid Status Values

- `in_warehouse` - Package is at the warehouse facility
- `in_transit` - Package is on the way to destination
- `out_for_delivery` - Package is out for final delivery
- `delivered` - Package has been delivered successfully
- `delivery_attempted` - Delivery was attempted but unsuccessful
- `undeliverable` - Package cannot be delivered

To get valid statuses programmatically:

```typescript
const validStatuses = driverService.getValidStatuses();
validStatuses.forEach(status => {
  console.log(`${status.value}: ${status.label} - ${status.description}`);
});
```

#### Usage Example

```typescript
try {
  const shipmentId = 123;
  
  const statusUpdate = {
    status: 'in_transit',
    notes: 'Package picked up from warehouse and en route to destination'
  };
  
  const result = await driverService.updateShipmentStatus(shipmentId, statusUpdate);
  
  console.log('Status updated successfully!');
  console.log(`Old status: ${result.old_status}`);
  console.log(`New status: ${result.new_status}`);
  console.log(`Updated at: ${result.updated_at}`);
  console.log(`Notes: ${result.notes || 'None'}`);
} catch (error) {
  if (error.message.includes('Invalid status transition')) {
    console.error('Cannot transition from current status to the requested status');
  } else {
    console.error('Status update failed:', error.message);
  }
}
```

#### Response Structure

```typescript
interface DriverUpdateShipmentStatusResponse {
  success: boolean;
  message: string;
  shipment_id: number;
  old_status: string;
  new_status: string;
  notes?: string;
  updated_at: string;
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Shipment status updated successfully",
  "shipment_id": 1,
  "old_status": "in_warehouse",
  "new_status": "in_transit",
  "notes": "Package picked up from warehouse and en route to destination",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

| Status Code | Description                                           |
|-------------|-------------------------------------------------------|
| 400         | Invalid status transition or shipment not found       |
| 401         | Authentication required                               |
| 403         | Driver role required                                  |
| 404         | Shipment not found                                    |
| 422         | Validation error (invalid status or notes too long)   |

---

## Complete Integration Example

Here's a complete example showing how to integrate all three endpoints in a driver mobile app:

```typescript
import { driverService } from '@/lib/api';

// Driver Dashboard Component
const DriverDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DriverShipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<DriverShipment | null>(null);
  
  // Search for shipments
  const handleSearch = async () => {
    try {
      const results = await driverService.searchShipments(searchQuery);
      setSearchResults(results.shipments);
    } catch (error) {
      console.error('Search failed:', error);
      alert(`Search failed: ${error.message}`);
    }
  };
  
  // View shipment details
  const handleViewDetails = async (shipmentId: number) => {
    try {
      const shipment = await driverService.getShipmentById(shipmentId);
      setSelectedShipment(shipment);
    } catch (error) {
      console.error('Failed to load shipment:', error);
      alert(`Failed to load shipment: ${error.message}`);
    }
  };
  
  // Update shipment status
  const handleUpdateStatus = async (shipmentId: number, newStatus: string) => {
    try {
      const result = await driverService.updateShipmentStatus(shipmentId, {
        status: newStatus,
        notes: `Status changed from ${selectedShipment?.status} to ${newStatus}`
      });
      
      alert(`Status updated successfully! Shipment is now ${result.new_status}`);
      
      // Refresh the shipment details
      handleViewDetails(shipmentId);
    } catch (error) {
      console.error('Status update failed:', error);
      alert(`Status update failed: ${error.message}`);
    }
  };
  
  return (
    <div>
      {/* Search UI */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter tracking code or shipment ID"
      />
      <button onClick={handleSearch}>Search</button>
      
      {/* Search Results */}
      {searchResults.map(shipment => (
        <div key={shipment.id} onClick={() => handleViewDetails(shipment.id)}>
          <h3>{shipment.tracking_code}</h3>
          <p>Status: {shipment.status}</p>
          <p>Receiver: {shipment.receiver_name}</p>
        </div>
      ))}
      
      {/* Shipment Details */}
      {selectedShipment && (
        <div>
          <h2>Shipment Details</h2>
          <p>Tracking: {selectedShipment.tracking_code}</p>
          <p>Status: {selectedShipment.status}</p>
          <p>Receiver: {selectedShipment.receiver_name}</p>
          <p>Address: {selectedShipment.receiver_address}</p>
          <p>Notes: {selectedShipment.delivery_notes || 'None'}</p>
          
          {/* Status Update Buttons */}
          <button onClick={() => handleUpdateStatus(selectedShipment.id, 'in_transit')}>
            Mark In Transit
          </button>
          <button onClick={() => handleUpdateStatus(selectedShipment.id, 'out_for_delivery')}>
            Mark Out for Delivery
          </button>
          <button onClick={() => handleUpdateStatus(selectedShipment.id, 'delivered')}>
            Mark Delivered
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Error Handling Best Practices

```typescript
const handleDriverAction = async () => {
  try {
    // Perform driver action
    const result = await driverService.searchShipments('PCG123');
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes('Authentication required')) {
      // Redirect to login
      router.push('/driver-login');
    } else if (error.message.includes('Driver role required')) {
      // Show access denied message
      alert('You must be a driver to access this feature');
    } else if (error.message.includes('Validation error')) {
      // Show validation error to user
      alert('Invalid input. Please check your data and try again.');
    } else {
      // Generic error handling
      console.error('Action failed:', error);
      alert('An error occurred. Please try again later.');
    }
  }
};
```

---

## Testing

You can test the driver service with mock data or by connecting to the API:

```typescript
// Test search
const testSearch = async () => {
  try {
    const results = await driverService.searchShipments('TEST123');
    console.log('Search test passed:', results);
  } catch (error) {
    console.error('Search test failed:', error);
  }
};

// Test get shipment
const testGetShipment = async () => {
  try {
    const shipment = await driverService.getShipmentById(1);
    console.log('Get shipment test passed:', shipment);
  } catch (error) {
    console.error('Get shipment test failed:', error);
  }
};

// Test update status
const testUpdateStatus = async () => {
  try {
    const result = await driverService.updateShipmentStatus(1, {
      status: 'in_transit',
      notes: 'Test update'
    });
    console.log('Update status test passed:', result);
  } catch (error) {
    console.error('Update status test failed:', error);
  }
};

// Run all tests
const runTests = async () => {
  await testSearch();
  await testGetShipment();
  await testUpdateStatus();
};
```

---

## Additional Notes

1. **Authentication**: All driver endpoints require valid authentication. Make sure the user is logged in before calling these endpoints.

2. **Driver Role**: These endpoints are restricted to users with the 'driver' role. Merchants and admins cannot access these endpoints.

3. **Rate Limiting**: The API implements rate limiting. Be mindful of how frequently you make requests.

4. **Error Logging**: All errors are logged to the console for debugging. In production, consider using a proper error tracking service.

5. **Offline Support**: Consider implementing offline caching for driver operations to handle network connectivity issues.

---

## Support

For additional support or questions about the driver API endpoints, please contact:
- Email: support@parcego.com
- Documentation: https://docs.parcego.com/driver-api

