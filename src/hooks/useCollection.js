import { useState, useEffect } from 'react';
import { getCollection } from '../api/firebase/firestore';

export const useCollection = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCollection(collectionName);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`Error fetching collection ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    if (collectionName) {
      fetchData();
    }
  }, [collectionName]);

  return { data, loading, error };
};