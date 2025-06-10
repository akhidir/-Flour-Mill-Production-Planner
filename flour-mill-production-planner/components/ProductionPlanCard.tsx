import React from 'react';
import { ProductionPlan, PlanStatus } from '../types';
import Button from './Button';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface ProductionPlanCardProps {
  plan: ProductionPlan;
  onEdit: (plan: ProductionPlan) => void;
  onDelete: (planId: string) => void;
}

const statusColors: Record<PlanStatus, string> = {
  [PlanStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [PlanStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300',
  [PlanStatus.Completed]: 'bg-green-100 text-green-800 border-green-300',
  [PlanStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-300',
};

const ProductionPlanCard: React.FC<ProductionPlanCardProps> = ({ plan, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-brand-primary break-all">{plan.planName}</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${statusColors[plan.status]}`}>
            {plan.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <p><strong className="font-medium text-gray-800">Product:</strong> {plan.productName}</p>
          <p><strong className="font-medium text-gray-800">Flour Type:</strong> {plan.flourType}</p>
          <p><strong className="font-medium text-gray-800">Total Quantity:</strong> {plan.quantityKg.toLocaleString()} kg</p>
          {plan.packageWeightKg && (
            <p><strong className="font-medium text-gray-800">Package:</strong> {plan.packageWeightKg} kg</p>
          )}
          {plan.numberOfPackages && (
            <p><strong className="font-medium text-gray-800">Units:</strong> {Math.ceil(plan.numberOfPackages).toLocaleString()} packages</p>
          )}
          <p><strong className="font-medium text-gray-800">Start Date:</strong> {formatDate(plan.startDate)}</p>
          <p><strong className="font-medium text-gray-800">End Date:</strong> {formatDate(plan.endDate)}</p>
          {plan.notes && <p className="mt-2 pt-2 border-t border-gray-200"><strong className="font-medium text-gray-800">Notes:</strong> <span className="text-gray-600 block whitespace-pre-wrap">{plan.notes}</span></p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={() => onEdit(plan)} leftIcon={<EditIcon />}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(plan.id)} leftIcon={<TrashIcon />}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ProductionPlanCard;
