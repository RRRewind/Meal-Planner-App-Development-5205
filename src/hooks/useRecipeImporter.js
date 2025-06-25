import { useState, useEffect } from 'react';
import { recipeImporter } from '../lib/recipeImporter';

export const useRecipeImporter = () => {
  const [importRequest, setImportRequest] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Listen for recipe import requests
    const handleImportRequest = (event) => {
      console.log('🍽️ Recipe import request received:', event.detail);
      setImportRequest(event.detail.recipeData);
      setIsImporting(true);
    };

    window.addEventListener('recipeImportRequest', handleImportRequest);

    // Initialize the importer
    recipeImporter.initialize();

    return () => {
      window.removeEventListener('recipeImportRequest', handleImportRequest);
    };
  }, []);

  const clearImportRequest = () => {
    setImportRequest(null);
    setIsImporting(false);
  };

  return {
    importRequest,
    isImporting,
    clearImportRequest
  };
};

export default useRecipeImporter;