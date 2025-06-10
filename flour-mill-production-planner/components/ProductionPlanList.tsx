
import React from 'react';
import { ProductionPlan } from '../types';
import ProductionPlanCard from './ProductionPlanCard';

interface ProductionPlanListProps {
  plans: ProductionPlan[];
  onEditPlan: (plan: ProductionPlan) => void;
  onDeletePlan: (planId: string) => void;
}

const ProductionPlanList: React.FC<ProductionPlanListProps> = ({ plans, onEditPlan, onDeletePlan }) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No production plans</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new production plan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <ProductionPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEditPlan}
          onDelete={onDeletePlan}
        />
      ))}
    </div>
  );
};

export default ProductionPlanList;
