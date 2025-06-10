
import React from 'react';

interface TrashIconProps {
  className?: string;
}

const TrashIcon: React.FC<TrashIconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.298.29m-.115-.287c.055-.172.115-.341.186-.503m11.196 0c-.09.162-.18.331-.287.503M7.75 4.25V3.375c0-.621.504-1.125 1.125-1.125H15.25c.621 0 1.125.504 1.125 1.125V4.25m-7.5 0h7.5" />
  </svg>
);

export default TrashIcon;
