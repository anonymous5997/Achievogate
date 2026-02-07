import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../../firebaseConfig';

class ExportService {

    /**
     * Export Collection to CSV and Share
     * @param {string} societyId 
     * @param {string} collectionName 
     */
    async exportToCSV(societyId, collectionName) {
        try {
            let q;
            if (collectionName === 'residents') {
                q = query(
                    collection(db, 'users'),
                    where('societyId', '==', societyId),
                    where('role', '==', 'resident')
                );
            } else {
                q = query(collection(db, collectionName), where('societyId', '==', societyId));
            }

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                Alert.alert('No Data', `No records found in ${collectionName}`);
                return;
            }

            // 1. Get all keys
            const docs = snapshot.docs.map(d => d.data());
            const headers = Object.keys(docs[0]).join(',');

            // 2. Create CSV content
            const rows = docs.map(d => Object.values(d).map(v =>
                `"${String(v).replace(/"/g, '""')}"` // Escape quotes
            ).join(','));

            const csvContent = `${headers}\n${rows.join('\n')}`;

            // 3. Save to File
            const fileName = `${collectionName}_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            // 4. Share
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Saved', `File saved to: ${fileUri}`);
            }

            return { success: true };

        } catch (error) {
            console.error('Export Error:', error);
            Alert.alert('Export Failed', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Import Residents from CSV String (Paste)
     * Format: Name,Email,Flat,Phone,Role
     */
    async importResidentsFromCSV(societyId, csvString) {
        try {
            const lines = csvString.trim().split('\n');
            const batch = writeBatch(db);
            let count = 0;

            // Skip header if present (rudimentary check)
            const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const [name, email, flat, phone, role] = lines[i].split(',').map(s => s.trim());

                if (!name || !email) continue;

                // Create User Doc (Auto ID)
                const newRef = doc(collection(db, 'users'));
                batch.set(newRef, {
                    name,
                    email,
                    flatNumber: flat,
                    phone,
                    role: role || 'resident',
                    societyId,
                    createdAt: new Date(),
                    status: 'approved'
                });
                count++;
            }

            await batch.commit();
            return { success: true, count };

        } catch (error) {
            console.error('Import Error:', error);
            return { success: false, error: error.message };
        }
    }

}

export default new ExportService();
