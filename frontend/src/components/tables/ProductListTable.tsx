import React from 'react';

interface Props {
  shopId: string;
}

const ProductListTable: React.FC<Props> = ({ shopId }) => {
  return <div>Product list table for shop {shopId}</div>;
};

export default ProductListTable;
