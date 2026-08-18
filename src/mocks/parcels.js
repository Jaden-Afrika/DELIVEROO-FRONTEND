/**
 * Mock parcels — shape matches what the Flask API will return for
 * /parcels and /parcels/:id (next week).
 *
 * Expected shape (real API):
 *   {
 *     id: string,                       // stable primary key
 *     pickupLocation: string,
 *     destination: string,
 *     weight: string,                   // weight category display string
 *     price: number,                    // quote in Ksh
 *     status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
 *     currentLocation: string,
 *     dateCreated: string,              // ISO 8601
 *     createdBy: string,                // user id
 *   }
 *
 * `cancelled` is not assigned by the API — it's the result of the
 * client-side cancelParcel action (cancellation only allowed before
 * delivery).
 */
const parcels = [
  {
    id: 'p-1001',
    pickupLocation: 'Westlands, Nairobi',
    destination: 'Kilimani, Nairobi',
    weight: 'Medium (5-10kg)',
    price: 450,
    status: 'in_transit',
    currentLocation: 'Museum Hill, Nairobi',
    dateCreated: '2026-08-14T09:15:00.000Z',
    createdBy: 'user-1',
  },
  {
    id: 'p-1002',
    pickupLocation: 'Roysambu, Nairobi',
    destination: 'Nairobi CBD',
    weight: 'Small (0-5kg)',
    price: 300,
    status: 'pending',
    currentLocation: 'Roysambu, Nairobi',
    dateCreated: '2026-08-17T10:30:00.000Z',
    createdBy: 'user-1',
  },
  {
    id: 'p-1003',
    pickupLocation: 'Kasarani, Nairobi',
    destination: 'Juja, Kiambu',
    weight: 'Large (10kg+)',
    price: 900,
    status: 'delivered',
    currentLocation: 'Juja, Kiambu',
    dateCreated: '2026-08-10T08:00:00.000Z',
    createdBy: 'user-1',
  },
  {
    id: 'p-1004',
    pickupLocation: 'Mombasa Road, Nairobi',
    destination: 'JKIA, Nairobi',
    weight: 'Small (0-5kg)',
    price: 350,
    status: 'in_transit',
    currentLocation: 'Gateway Mall, Nairobi',
    dateCreated: '2026-08-16T14:45:00.000Z',
    createdBy: 'user-2',
  },
  {
    id: 'p-1005',
    pickupLocation: 'Githurai, Nairobi',
    destination: 'Thika, Kiambu',
    weight: 'Medium (5-10kg)',
    price: 500,
    status: 'pending',
    currentLocation: 'Githurai, Nairobi',
    dateCreated: '2026-08-18T07:20:00.000Z',
    createdBy: 'user-2',
  },
  {
    id: 'p-1006',
    pickupLocation: 'Karen, Nairobi',
    destination: 'Westlands, Nairobi',
    weight: 'Large (10kg+)',
    price: 800,
    status: 'delivered',
    currentLocation: 'Westlands, Nairobi',
    dateCreated: '2026-08-12T11:10:00.000Z',
    createdBy: 'user-2',
  },
]

export default parcels