import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { itemCategories } from '../../utils/mockData';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { ItemFormData, ItemCategory } from '../../types';

interface ItemFormProps {
  onSubmit: (formData: ItemFormData) => Promise<void>;
  isSubmitting: boolean;
  type: 'lost' | 'found';
}

const ItemForm: React.FC<ItemFormProps> = ({ onSubmit, isSubmitting, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'File must be an image' }));
        return;
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ItemFormData, string>> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData: ItemFormData = {
      title,
      description,
      category,
      location,
      image,
    };
    
    try {
      await onSubmit(formData);
      
      // Reset form on successful submission
      setTitle('');
      setDescription('');
      setCategory('electronics');
      setLocation('');
      setImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <Input
          label="Title"
          id="title"
          placeholder={`Enter a title for your ${type} item`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
        
        <Textarea
          label="Description"
          id="description"
          placeholder={`Describe your ${type} item in detail (color, brand, identifying features, etc.)`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />
        
        <Select
          label="Category"
          id="category"
          options={itemCategories}
          value={category}
          onChange={(value) => setCategory(value as ItemCategory)}
          error={errors.category}
          required
        />
        
        <Input
          label="Location"
          id="location"
          placeholder={`Where was the item ${type}?`}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          error={errors.location}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Image (optional)
          </label>
          
          {!previewUrl ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1 relative rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-64 w-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-100"
                onClick={removeImage}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {errors.image && <p className="mt-1 text-sm text-error-600">{errors.image}</p>}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : `Report ${type} Item`}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;