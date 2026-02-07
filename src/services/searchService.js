import { collection, endAt, getDocs, limit, orderBy, query, startAt, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Enterprise Search Service
 * Handles multi-collection search queries with society scoping.
 */
class SearchService {

    /**
     * Perform Global Search
     * @param {string} societyId - Scoped Society ID
     * @param {string} searchTerm - Query string
     */
    async globalSearch(societyId, searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return { success: true, results: [] };

        const term = searchTerm.toLowerCase();
        // Firestore simple prefix search hack: startAt(term) endAt(term + '\uf8ff')
        // Note: This requires case-sensitive match usually, or storing a lowercase field.
        // For this MVP, we will attempt basic querying. 
        // Ideally, we'd use Algolia or Typesense, but we are sticking to Firestore.

        try {
            console.log(`🔍 Searching for "${term}" in Society: ${societyId}`);

            const results = {
                users: [],
                visitors: [],
                flats: [],
                vehicles: []
            };

            // 1. Search Users (Name)
            // Note: In production, store "name_lower" field for case-insensitive search
            // For now, we fetch a batch and filter client-side if dataset is small, 
            // OR use the prefix method on 'name' assuming proper casing.
            // Let's try basic prefix match on 'name'.

            // NOTE: Firestore case sensitivity is a pain. 
            // We will fetch recent/active folks and filter in JS for "MyGate-level" responsiveness 
            // without complex indexing for this demo. 
            // REAL ENTERPRISE SOLUTION: Use a devoted search index.

            // Strategy: Fetch up to 50 items from each collection and filter locally? No, that's bad scaling.
            // Strategy: Use Firestore '>=', '<=' on specific fields.
            // But we can't do case-insensitive easily. 
            // We will assume the user types matching case or we search blindly.

            // Let's implement the "Client-Side Filter of specific collections" approach for the Demo 
            // because establishing standard search indexes takes external services.
            // AND we can query specific fields if we have exact matches (like Flat Number).

            // A. Search Flats (Exact match usually)
            const flatsQ = query(
                collection(db, 'flats'),
                where('societyId', '==', societyId),
                where('flatNumber', '>=', searchTerm),
                where('flatNumber', '<=', searchTerm + '\uf8ff'),
                limit(5)
            );
            const flatsSnap = await getDocs(flatsQ);
            results.flats = flatsSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'flat' }));

            // B. Search Visitors (Name)
            const visQ = query(
                collection(db, 'visitors'),
                where('societyId', '==', societyId),
                orderBy('visitorName'),
                startAt(searchTerm),
                endAt(searchTerm + '\uf8ff'),
                limit(5)
            );
            // Note: This query requires an index on `societyId` + `visitorName`.
            // If it fails, we catch it.
            try {
                const visSnap = await getDocs(visQ);
                results.visitors = visSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'visitor' }));
            } catch (e) {
                console.warn('Visitor search index missing, skipping native search', e);
            }

            // C. Search Users (Name) 
            // Same index requirement: societyId + name
            const userQ = query(
                collection(db, 'users'),
                where('societyId', '==', societyId),
                where('role', 'in', ['resident', 'guard']),
                orderBy('name'),
                startAt(searchTerm),
                endAt(searchTerm + '\uf8ff'),
                limit(5)
            );
            try {
                const userSnap = await getDocs(userQ);
                results.users = userSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'user' }));
            } catch (e) {
                console.warn('User search index missing', e);
            }

            return { success: true, results };

        } catch (error) {
            console.error('Search Service Error:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new SearchService();
