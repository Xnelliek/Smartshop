import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  shopId: string;
}

const ProductFormModal: React.FC<Props> = ({ open, onClose, shopId }) => {
  return open ? <div>Product Form Modal for shop {shopId}</div> : null;
};

export default ProductFormModal;
