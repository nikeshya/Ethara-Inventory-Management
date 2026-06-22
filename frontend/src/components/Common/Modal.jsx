import React, { useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={handleBackdropClick}>
      <div 
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white border border-dark-border rounded-xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-dark-border shrink-0">
          <h3 className="text-xl font-bold text-[#0f1111] tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#565959] hover:text-[#0f1111] hover:bg-[#f3f3f3] p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#007185]"
          >
            <HiX className="text-xl" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
