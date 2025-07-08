import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  shop: any;
}

const ShopFormModal: React.FC<Props> = ({ open, onClose, shop }) => {
  return open ? <div>Shop Form Modal for shop {shop?.id}</div> : null;
};

export default ShopFormModal;
