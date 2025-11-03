import { useState, useEffect } from 'react';
import { getDocument } from '../api/firebase/firestore';

export const useDocument = (collectionName, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDocument(collectionName, id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`Error fetching document ${id} from ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    if (collectionName && id) {
      fetchData();
    }
  }, [collectionName, id]);

  return { data, loading, error };
};