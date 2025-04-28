// // donationdrive-list/featured/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { DonationDrive } from '@/models/models';
// import Sidebar from '../components/Sidebar';
// import DonationDrivesList from '../components/DonationDrivesList';

// export default function FeaturedStoriesPage() {
//   const [featuredDrives, setFeaturedDrives] = useState<DonationDrive[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchFeaturedStories = async () => {
//       try {
//         const drivesRef = collection(db, 'donationDrives');
//         const drivesQuery = query(
//           drivesRef,
//           where('isFeatured', '==', true),
//           orderBy('datePosted', 'desc'),
//           limit(5)
//         );
        
//         const snapshot = await getDocs(drivesQuery);
//         const drives = snapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             ...data,
//             donationDriveId: doc.id,
//             datePosted: data.datePosted?.toDate(),
//             startDate: data.startDate?.toDate(),
//             endDate: data.endDate?.toDate(),
//           } as DonationDrive;
//         });
        
//         setFeaturedDrives(drives);
//       } catch (error) {
//         console.error('Error fetching featured stories:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeaturedStories();
//   }, []);

//   return (
//     <div className="donation-drives-container">
//       <Sidebar />
//       <main>
//         <h1>Featured Stories</h1>
//         {loading ? (
//           <p>Loading featured stories...</p>
//         ) : (
//           <DonationDrivesList drives={featuredDrives} />
//         )}
//       </main>
//     </div>
//   );
// }