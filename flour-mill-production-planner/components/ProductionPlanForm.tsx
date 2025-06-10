import React, { useState, useEffect, useCallback } from 'react';
import { ProductionPlan, PlanStatus, ProductSpecification } from '../types';
import { FLOUR_TYPES, PLAN_STATUS_OPTIONS, API_KEY_ERROR_MESSAGE } from '../constants';
import { suggestPlanName } from '../services/geminiService';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import Button from './Button';
import SparklesIcon from './icons/SparklesIcon';

interface ProductionPlanFormProps {
  onSubmit: (plan: ProductionPlan) => void;
  onClose: () => void;
  initialData?: ProductionPlan | null;
  productSpecs?: ProductSpecification[]; // Pass all specs to find matching one
}

const ProductionPlanForm: React.FC<ProductionPlanFormProps> = ({ onSubmit, onClose, initialData, productSpecs = [] }) => {
  const [planName, setPlanName] = useState('');
  const [productName, setProductName] = useState('');
  const [flourType, setFlourType] = useState(FLOUR_TYPES[0] || '');
  const [quantityKg, setQuantityKg] = useState<number | string>(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<PlanStatus>(PlanStatus.Pending);
  const [notes, setNotes] = useState('');
  
  const [packageWeightKg, setPackageWeightKg] = useState<number | undefined>(undefined);
  const [numberOfPackages, setNumberOfPackages] = useState<number | undefined>(undefined);

  const [errors, setErrors] = useState<Partial<Record<keyof ProductionPlan | 'productName', string>>>({});
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPlanName(initialData.planName);
      setProductName(initialData.productName);
      setFlourType(initialData.flourType);
      setQuantityKg(initialData.quantityKg);
      setStartDate(initialData.startDate.split('T')[0]);
      setEndDate(initialData.endDate.split('T')[0]);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
      setPackageWeightKg(initialData.packageWeightKg);
      setNumberOfPackages(initialData.numberOfPackages);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
    }
  }, [initialData]);

  useEffect(() => {
    const currentProductSpec = productSpecs.find(spec => spec.productName === productName);
    if (currentProductSpec) {
      setPackageWeightKg(currentProductSpec.packageWeightKg);
      if (Number(quantityKg) > 0 && currentProductSpec.packageWeightKg > 0) {
        setNumberOfPackages(Math.ceil(Number(quantityKg) / currentProductSpec.packageWeightKg));
      } else {
        setNumberOfPackages(undefined);
      }
    } else {
      setPackageWeightKg(undefined);
      setNumberOfPackages(undefined);
    }
  }, [productName, quantityKg, productSpecs]);


  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductionPlan | 'productName', string>> = {};
    if (!planName.trim()) newErrors.planName = 'Plan name is required.';
    if (!productName.trim()) newErrors.productName = 'Product name is required.';
    if (!flourType) newErrors.flourType = 'Flour type is required.';
    if (Number(quantityKg) <= 0) newErrors.quantityKg = 'Quantity must be greater than 0.';
    if (!startDate) newErrors.startDate = 'Start date is required.';
    if (!endDate) newErrors.endDate = 'End date is required.';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const planData: ProductionPlan = {
        id: initialData?.id || crypto.randomUUID(),
        planName,
        productName,
        flourType,
        quantityKg: Number(quantityKg),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status,
        notes,
        packageWeightKg: packageWeightKg,
        numberOfPackages: numberOfPackages,
      };
      onSubmit(planData);
    }
  };

  const handleSuggestName = useCallback(async () => {
    if ((!productName && !flourType) || Number(quantityKg) <= 0) {
      setSuggestionError("Please provide a Product Name or Flour Type and a valid quantity first.");
      return;
    }
    setSuggestionError(null);
    setIsSuggestingName(true);
    try {
      const suggestedName = await suggestPlanName(productName, Number(quantityKg), flourType);
      setPlanName(suggestedName);
      setErrors(prev => ({...prev, planName: undefined}));
    } catch (error) {
        if (error instanceof Error) {
            setSuggestionError(error.message);
        } else {
            setSuggestionError("An unknown error occurred while suggesting name.");
        }
    } finally {
      setIsSuggestingName(false);
    }
  }, [productName, flourType, quantityKg]);
  
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
    // Potentially auto-fill flourType if a mapping exists or clear it
  };

  const isApiKeyMissing = !process.env.API_KEY;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Plan Name"
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            error={errors.planName}
            required
          />
           {suggestionError && <p className="mt-1 text-xs text-red-600">{suggestionError}</p>}
        </div>
        
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggestName}
            isLoading={isSuggestingName}
            disabled={isSuggestingName || (!productName && !flourType) || Number(quantityKg) <= 0 || isApiKeyMissing}
            leftIcon={<SparklesIcon className="w-4 h-4" />}
          >
            Suggest Plan Name with AI
          </Button>
          {isApiKeyMissing && <p className="mt-1 text-xs text-red-600">{API_KEY_ERROR_MESSAGE}</p>}
        </div>

        <Input
          label="Product Name"
          id="productName"
          value={productName}
          onChange={handleProductNameChange}
          error={errors.productName}
          required
        />
        <Select
          label="Flour Type (Category)"
          id="flourType"
          options={FLOUR_TYPES.map(ft => ({ value: ft, label: ft }))}
          value={flourType}
          onChange={(e) => setFlourType(e.target.value)}
          error={errors.flourType}
          required
        />
      </div>

       <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
        <Input
          label="Total Quantity (kg)"
          id="quantityKg"
          type="number"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
          error={errors.quantityKg}
          min="1"
          required
        />
         <Input
            label="Package Weight (kg)"
            id="packageWeightKg"
            type="number"
            value={packageWeightKg ?? ''}
            readOnly // This value comes from product specs
            className="bg-gray-100"
          />
          <Input
            label="Number of Packages"
            id="numberOfPackages"
            type="number"
            value={numberOfPackages ?? ''}
            readOnly // Calculated
            className="bg-gray-100"
          />
      </div>


      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <Input
          label="Start Date"
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
          required
        />
        <Input
          label="End Date"
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errors.endDate}
          required
        />
      </div>

      <Select
        label="Status"
        id="status"
        options={PLAN_STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value as PlanStatus)}
        required
      />

      <Textarea
        label="Notes (Optional)"
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="pt-2 flex items-center justify-end space-x-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};

export default ProductionPlanForm;
