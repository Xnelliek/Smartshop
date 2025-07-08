import React from 'react';

export const InventoryStatus: React.FC<{ shopId: string }> = ({ shopId }) => {
  return <div>InventoryStatus component for shop: {shopId}</div>;
};
