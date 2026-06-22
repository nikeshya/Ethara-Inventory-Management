import React from 'react';
import Modal from './Modal';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-400/10 text-red-500' : 'bg-brand-500/10 text-brand-500'}`}>
          <HiOutlineExclamationCircle className="text-3xl" />
        </div>
        <p className="text-gray-300 text-sm mb-6">{message}</p>
        
        <div className="flex w-full gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
