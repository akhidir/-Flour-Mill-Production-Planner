
import React, { useState, useEffect, useCallback } from 'react';
import { ProductionPlan, PlanStatus, MillSettings, PackerSettings, ProductSpecification } from './types';
import { DEFAULT_MILL_SETTINGS, DEFAULT_PACKER_SETTINGS, FLOUR_TYPES } from './constants';
import { parseProductionPlanExcel, parseProductSpecificationsExcel } from './services/excelService';

import Navbar from './components/Navbar';
import ProductionPlanList from './components/ProductionPlanList';
import ProductionPlanForm from './components/ProductionPlanForm';
import Modal from './components/Modal';
import Button from './components/Button';
import PlusIcon from './components/icons/PlusIcon';
import LoadingSpinner from './components/LoadingSpinner';
import FileUpload from './components/FileUpload';
import SettingsModal from './components/SettingsModal';
import XMarkIcon from './components/icons/XMarkIcon'; // Added for error message close button

const App: React.FC = () => {
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [productSpecs, setProductSpecs] = useState<ProductSpecification[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);

  const [millSettings, setMillSettings] = useState<MillSettings>(() => {
    const saved = localStorage.getItem('millSettings');
    return saved ? JSON.parse(saved) : DEFAULT_MILL_SETTINGS;
  });
  const [packerSettings, setPackerSettings] = useState<PackerSettings>(() => {
    const saved = localStorage.getItem('packerSettings');
    return saved ? JSON.parse(saved) : DEFAULT_PACKER_SETTINGS;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fileProcessingMessage, setFileProcessingMessage] = useState<string | null>(null);


  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedPlans = localStorage.getItem('productionPlans');
      if (savedPlans) {
        setProductionPlans(JSON.parse(savedPlans));
      }
      const savedSpecs = localStorage.getItem('productSpecs');
      if (savedSpecs) {
        setProductSpecs(JSON.parse(savedSpecs));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      setGlobalError("Could not load saved data. It might be corrupted.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('productionPlans', JSON.stringify(productionPlans));
    } catch (error) {
      console.error("Failed to save production plans to localStorage:", error);
      setGlobalError("Could not save production plans. Storage might be full or an error occurred.");
    }
  }, [productionPlans]);

  useEffect(() => {
    try {
      localStorage.setItem('productSpecs', JSON.stringify(productSpecs));
    } catch (error) {
      console.error("Failed to save product specs to localStorage:", error);
      setGlobalError("Could not save product specifications. Storage might be full or an error occurred.");
    }
  }, [productSpecs]);

  useEffect(() => {
    localStorage.setItem('millSettings', JSON.stringify(millSettings));
  }, [millSettings]);

  useEffect(() => {
    localStorage.setItem('packerSettings', JSON.stringify(packerSettings));
  }, [packerSettings]);

  const mergePlanWithSpecs = useCallback((plan: Partial<ProductionPlan>, currentSpecs: ProductSpecification[]): ProductionPlan => {
    const spec = currentSpecs.find(s => s.productName === plan.productName);
    let updatedPlan = { ...plan } as ProductionPlan; // Cast to full ProductionPlan
    
    if (!updatedPlan.id) updatedPlan.id = crypto.randomUUID();
    if (!updatedPlan.status) updatedPlan.status = PlanStatus.Pending;
    if (!updatedPlan.flourType && FLOUR_TYPES.length > 0) updatedPlan.flourType = FLOUR_TYPES[0];


    if (spec) {
      updatedPlan.packageWeightKg = spec.packageWeightKg;
      if (updatedPlan.quantityKg && spec.packageWeightKg > 0) {
        updatedPlan.numberOfPackages = Math.ceil(updatedPlan.quantityKg / spec.packageWeightKg);
      } else {
        updatedPlan.numberOfPackages = undefined;
      }
    } else {
        updatedPlan.packageWeightKg = undefined;
        updatedPlan.numberOfPackages = undefined;
    }
    return updatedPlan;
  }, []);


  const handleAddPlan = (planData: ProductionPlan) => {
    const newPlan = mergePlanWithSpecs(planData, productSpecs);
    setProductionPlans(prevPlans => [...prevPlans, newPlan]);
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleUpdatePlan = (updatedPlanData: ProductionPlan) => {
    const finalPlan = mergePlanWithSpecs(updatedPlanData, productSpecs);
    setProductionPlans(prevPlans =>
      prevPlans.map(p => (p.id === finalPlan.id ? finalPlan : p))
    );
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        setProductionPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
    }
  };

  const openEditModal = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, type: 'plan' | 'specs') => {
    setIsProcessingFile(true);
    setGlobalError(null);
    setFileProcessingMessage(`Processing ${type === 'plan' ? 'production plan' : 'product specs'} file: ${file.name}...`);
    try {
      if (type === 'plan') {
        const parsedPlans = await parseProductionPlanExcel(file);
        const newPlans = parsedPlans.map(p => mergePlanWithSpecs(p, productSpecs));
        setProductionPlans(newPlans); 
        setFileProcessingMessage(`${newPlans.length} production plans loaded successfully from ${file.name}. Existing manual plans were replaced by this import.`);
      } else if (type === 'specs') {
        const parsedSpecs = await parseProductSpecificationsExcel(file);
        setProductSpecs(parsedSpecs);
        setProductionPlans(prevPlans => prevPlans.map(p => mergePlanWithSpecs(p, parsedSpecs)));
        setFileProcessingMessage(`${parsedSpecs.length} product specifications loaded successfully from ${file.name}. Existing plans have been updated.`);
      }
    } catch (error) {
      console.error(`Error processing ${type} file:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setGlobalError(`Failed to process ${file.name}. Please ensure it's a valid Excel file with the correct format and all required columns (Product Name, Quantity (kg), Start Date, End Date for plans; Product Name, Package Weight (kg) for specs). Details: ${errorMessage}`);
      setFileProcessingMessage(null);
    } finally {
      setIsProcessingFile(false);
       setTimeout(() => { 
            setFileProcessingMessage(null);
        }, 7000);
    }
  };


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar onOpenSettings={() => setIsSettingsModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {globalError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
            <p className="font-bold">Error Occurred</p>
            <p>{globalError}</p>
            <button onClick={() => setGlobalError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error">
              <XMarkIcon className="w-5 h-5"/>
            </button>
          </div>
        )}
        {fileProcessingMessage && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded relative" role="alert">
            <p>{fileProcessingMessage}</p>
             <button onClick={() => setFileProcessingMessage(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close message">
              <XMarkIcon className="w-5 h-5"/>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
          <FileUpload
            id="productionPlanUpload"
            label="Upload Monthly Production Plan (Excel)"
            onFileUpload={(file) => handleFileUpload(file, 'plan')}
            accept=".xlsx, .xls"
            disabled={isProcessingFile}
          />
          <FileUpload
            id="productSpecsUpload"
            label="Upload Product Specifications (Excel)"
            onFileUpload={(file) => handleFileUpload(file, 'specs')}
            accept=".xlsx, .xls"
            disabled={isProcessingFile}
          />
        </div>
        
        {isProcessingFile && <div className="text-center my-4 p-4"><LoadingSpinner /> <p className="mt-2 text-gray-600">Processing uploaded file, please wait...</p></div>}

        <div className="flex justify-between items-center mb-6 px-1">
          <h1 className="text-3xl font-bold text-gray-800">Production Dashboard</h1>
          <Button
            variant="primary"
            onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
            leftIcon={<PlusIcon />}
            disabled={isProcessingFile}
            aria-label="Create new production plan"
          >
            Create New Plan
          </Button>
        </div>

        <ProductionPlanList
          plans={productionPlans}
          onEditPlan={openEditModal}
          onDeletePlan={handleDeletePlan}
        />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
        title={editingPlan ? 'Edit Production Plan' : 'Create New Production Plan'}
        size="xl"
      >
        <ProductionPlanForm
          onSubmit={editingPlan ? handleUpdatePlan : handleAddPlan}
          onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
          initialData={editingPlan}
          productSpecs={productSpecs}
        />
      </Modal>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentMillSettings={millSettings}
        onSaveMillSettings={setMillSettings}
        currentPackerSettings={packerSettings}
        onSavePackerSettings={setPackerSettings}
      />
    </div>
  );
};

export default App;
