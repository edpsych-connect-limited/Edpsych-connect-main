'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitInquiry, InquiryState } from '@/actions/professional-inquiry-actions';
import { useState, useEffect } from 'react';

const initialState: InquiryState = {
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  );
}

interface ContactProfessionalFormProps {
  professionalId: string;
  professionalName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ContactProfessionalForm({ professionalId, professionalName, onSuccess, onCancel }: ContactProfessionalFormProps) {
  const [state, formAction] = useFormState(submitInquiry, initialState);
  
  useEffect(() => {
    if (state.success && onSuccess) {
        // Optional: wait a moment or show success message before closing
        const timer = setTimeout(() => {
            onSuccess();
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [state.success, onSuccess]);

  if (state.success) {
      return (
          <div className="p-6 bg-green-50 border border-green-200 rounded-md text-center">
              <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-green-800">Inquiry Sent!</h3>
              <p className="mt-2 text-sm text-green-700">{state.message}</p>
          </div>
      );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="professionalId" value={professionalId} />
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Contact {professionalName}</h3>
        <p className="text-sm text-gray-500 mt-1">Send a message to inquire about services.</p>
      </div>

      {state.message && !state.success && (
         <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
             {state.message}
         </div>
      )}

      <div>
        <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="senderName"
            id="senderName"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2.5 border"
            placeholder="John Doe"
          />
        </div>
        {state.errors?.senderName && (
          <p className="mt-1 text-sm text-red-600">{state.errors.senderName[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">
          Your Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            name="senderEmail"
            id="senderEmail"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2.5 border"
            placeholder="john@example.com"
          />
        </div>
        {state.errors?.senderEmail && (
          <p className="mt-1 text-sm text-red-600">{state.errors.senderEmail[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="subject"
            id="subject"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2.5 border"
            placeholder="Inquiry about assessment"
          />
        </div>
        {state.errors?.subject && (
          <p className="mt-1 text-sm text-red-600">{state.errors.subject[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <div className="mt-1">
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2.5 border"
            placeholder="Please describe your needs..."
          />
        </div>
        {state.errors?.message && (
          <p className="mt-1 text-sm text-red-600">{state.errors.message[0]}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        {onCancel && (
            <button
                type="button"
                onClick={onCancel}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancel
            </button>
        )}
        <SubmitButton />
      </div>
    </form>
  );
}
