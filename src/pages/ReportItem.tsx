import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useItems } from '../contexts/ItemContext';
import ItemForm from '../components/items/ItemForm';
import { ItemFormData, ItemType } from '../types';
import { Check } from 'lucide-react';
import Card from '../components/common/Card';

interface ReportItemProps {
  type: ItemType;
}

const ReportItem: React.FC<ReportItemProps> = ({ type }) => {
  const { user } = useAuth();
  const { reportItem, isLoading, error } = useItems();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData: ItemFormData) => {
    if (!user) return;

    try {
      await reportItem(type, formData, user);
      setSubmitted(true);
      
      // Reset submission state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error reporting item:', err);
    }
  };

  const typeLabel = type === 'lost' ? 'Lost' : 'Found';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report {typeLabel} Item</h1>
        <p className="mt-1 text-gray-600">
          Please provide as much detail as possible to help us {type === 'lost' ? 'find your item' : 'locate the owner'}.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
          <p className="text-error-700">{error}</p>
        </div>
      )}

      {submitted ? (
        <Card className="p-6 bg-success-50 border border-success-200">
          <div className="flex items-center justify-center flex-col text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-success-600" />
            </div>
            <h2 className="text-xl font-semibold text-success-800 mb-2">
              Item Reported Successfully!
            </h2>
            <p className="text-success-700">
              {type === 'lost'
                ? "We'll notify you if someone reports finding your item."
                : "Thank you for your submission. We'll try to match this with reported lost items."}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <ItemForm 
            onSubmit={handleSubmit} 
            isSubmitting={isLoading} 
            type={type} 
          />
        </Card>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> The system will automatically scan for potential matches once your item is reported.
          You'll be notified if a match is found.
        </p>
      </div>
    </div>
  );
};

export default ReportItem;