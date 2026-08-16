import React from 'react';
import { FIBPaymentModal } from './FIBPaymentModal';
import { SubscriptionPlan } from '../types';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  return (
    <FIBPaymentModal
      itemType="plan"
      plan={plan}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
