import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useToastContext } from '../contexts/ToastContext';
import { TAG_OPTIONS } from '../types';

interface FormData {
  title: string;
  date: string;
  description: string;
  evidenceSources: string[];
  tags: string[];
}

interface FormErrors {
  title?: string;
  date?: string;
  description?: string;
  evidenceSources?: string;
  tags?: string;
}

export const EventSubmission: React.FC = () => {
  const { account, isConnected } = useWallet();
  const toast = useToastContext();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: '',
    description: '',
    evidenceSources: [''],
    tags: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Evidence sources validation
    const validSources = formData.evidenceSources.filter(source => source.trim() !== '');
    if (validSources.length === 0) {
      newErrors.evidenceSources = 'At least one evidence source is required';
    }

    // Tags validation
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select at least one category';
    } else if (formData.tags.length > 5) {
      newErrors.tags = 'Maximum 5 categories allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle evidence source changes
  const handleEvidenceChange = (index: number, value: string) => {
    const newSources = [...formData.evidenceSources];
    newSources[index] = value;
    setFormData(prev => ({
      ...prev,
      evidenceSources: newSources,
    }));
    
    // Clear evidence error when user starts typing
    if (errors.evidenceSources) {
      setErrors(prev => ({
        ...prev,
        evidenceSources: undefined,
      }));
    }
  };

  // Add new evidence source field
  const addEvidenceSource = () => {
    setFormData(prev => ({
      ...prev,
      evidenceSources: [...prev.evidenceSources, ''],
    }));
  };

  // Remove evidence source field
  const removeEvidenceSource = (index: number) => {
    if (formData.evidenceSources.length > 1) {
      const newSources = formData.evidenceSources.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        evidenceSources: newSources,
      }));
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const isSelected = prev.tags.includes(tag);
      const newTags = isSelected
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      
      return {
        ...prev,
        tags: newTags,
      };
    });
    
    // Clear tag error when user selects a tag
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous submission state
    setSubmitSuccess(false);
    setSubmitError(null);
    setEventId(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check wallet connection
    if (!isConnected || !account) {
      setSubmitError('Please connect your wallet to submit an event');
      return;
    }

    setIsSubmitting(true);

    try {
      // Import contract service dynamically to avoid circular dependencies
      const { submitEvent } = await import('../services/contractService');
      const { web3Accounts } = await import('@polkadot/extension-dapp');
      
      // Get the full injected account
      const injectedAccounts = await web3Accounts();
      const injectedAccount = injectedAccounts.find(acc => acc.address === account.address);
      
      if (!injectedAccount) {
        setSubmitError('Could not find wallet account. Please reconnect your wallet.');
        return;
      }
      
      // Convert date to YYYYMMDD format (e.g., "1957-10-04" -> 19571004)
      // This format works for historical dates before 1970
      const dateStr = formData.date.replace(/-/g, ''); // Remove hyphens
      const dateNumber = parseInt(dateStr, 10);
      
      console.log('Form date value:', formData.date);
      console.log('Date as YYYYMMDD number:', dateNumber);
      
      // Validate date number is valid
      if (isNaN(dateNumber) || dateNumber < 10000101 || dateNumber > 99991231) {
        setSubmitError(`Invalid date format: ${formData.date}`);
        setIsSubmitting(false);
        return;
      }
      
      // Filter out empty evidence sources
      const validSources = formData.evidenceSources.filter(source => source.trim() !== '');

      // Submit event to contract
      const result = await submitEvent(
        injectedAccount,
        formData.title.trim(),
        dateNumber,
        formData.description.trim(),
        validSources,
        formData.tags
      );

      if (result.success) {
        setSubmitSuccess(true);
        setEventId(result.data?.eventId || 'Unknown');
        
        // Show success toast
        toast.success(
          `Event submitted successfully! ${result.data?.eventId ? `Event ID: ${result.data.eventId}` : ''}`,
          5000
        );
        
        // Clear form
        setFormData({
          title: '',
          date: '',
          description: '',
          evidenceSources: [''],
          tags: [],
        });
        setErrors({});
      } else {
        setSubmitError(result.error || 'Failed to submit event');
        toast.error(result.error || 'Failed to submit event', 7000);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast.error(errorMessage, 7000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If wallet not connected, show message
  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Submit Historical Event
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-400">
              Please connect your wallet to submit historical events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Submit Historical Event
      </h2>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
            Event Submitted Successfully!
          </h3>
          <p className="text-sm text-green-800 dark:text-green-400">
            Your event has been added to the Disputed timeline.
            {eventId && ` Event ID: ${eventId}`}
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
            Submission Failed
          </h3>
          <p className="text-sm text-red-800 dark:text-red-400">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g., The Fall of the Berlin Wall"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Provide a detailed description of the historical event..."
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select 1-5 categories that best describe this event
          </p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  formData.tags.includes(tag)
                    ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {formData.tags.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {formData.tags.length} / 5
            </p>
          )}
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
          )}
        </div>

        {/* Evidence Sources Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Evidence Sources <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.evidenceSources.map((source, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={source}
                  onChange={(e) => handleEvidenceChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., https://example.com/source or Book Title, Author, Year"
                  disabled={isSubmitting}
                />
                {formData.evidenceSources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvidenceSource(index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.evidenceSources && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.evidenceSources}</p>
          )}
          <button
            type="button"
            onClick={addEvidenceSource}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            disabled={isSubmitting}
          >
            + Add Another Evidence Source
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              isSubmitting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white'
                : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
