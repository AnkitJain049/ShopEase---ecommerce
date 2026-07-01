import React, { useEffect, useState } from 'react';

function Notification({ message, type, duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('animate-slide-in-right'); // Initial animation class for slide-in

  // Automatically hide the notification after 'duration' milliseconds
  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setAnimationClass('animate-slide-out-right'); // Start slide-out animation
      // Wait for the slide-out animation to complete before unmounting
      const finalDismissTimer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose(); // Call parent's onClose to remove from DOM
        }
      }, 300); // This duration should match the slide-out animation duration
      return () => clearTimeout(finalDismissTimer);
    }, duration);

    // Cleanup the initial dismiss timer if the component unmounts prematurely
    return () => clearTimeout(dismissTimer);
  }, [duration, onClose]);

  // Determine styling based on type with more noticeable colors
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500 dark:bg-green-700' : 'bg-red-500 dark:bg-red-700';
  const textColor = 'text-white';
  const iconBgColor = isSuccess ? 'bg-green-700 dark:bg-green-900' : 'bg-red-700 dark:bg-red-900';
  const iconTextColor = 'text-white';

  const btnBgColor = 'bg-transparent';
  const btnTextColor = 'text-white';
  const btnHoverBgColor = isSuccess ? 'hover:bg-green-600' : 'hover:bg-red-600';
  const btnHoverTextColor = 'hover:text-white';

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div
      id="toast-notification"
      // Apply the dynamic animationClass along with fixed positioning and styling
      className={`fixed top-20 right-5 z-50 flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow-xl transform transition-all duration-300 ease-out ${bgColor} ${textColor} ${animationClass}`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${iconBgColor} ${iconTextColor}`}>
        {isSuccess ? (
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
          </svg>
        )}
        <span className="sr-only">{isSuccess ? 'Check icon' : 'Error icon'}</span>
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className={`ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 ${btnBgColor} ${btnTextColor} ${btnHoverBgColor} ${btnHoverTextColor}`}
        onClick={() => {
          setAnimationClass('animate-slide-out-right'); // Start slide-out animation immediately on click
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) {
              onClose();
            }
          }, 300); // This duration should match the slide-out animation duration
        }}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default Notification;
