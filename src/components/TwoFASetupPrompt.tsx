import React, { useState } from 'react';

interface TwoFASetupPromptProps {
  onSetup: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

const TwoFASetupPrompt: React.FC<TwoFASetupPromptProps> = ({ 
  onSetup, 
  onSkip, 
  isLoading 
}) => {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    setIsSkipping(true);
    await onSkip();
    setIsSkipping(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Enhance Your Security
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Two-factor authentication adds an extra layer of security to your account.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              Protect your account from unauthorized access
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              Required for sensitive operations
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              Easy setup with authenticator apps like Google Authenticator
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onSetup}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Setting up...' : 'Set Up Two-Factor Authentication'}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={isLoading || isSkipping}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSkipping ? 'Skipping...' : 'Skip for Now'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            You can always enable two-factor authentication later in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFASetupPrompt;