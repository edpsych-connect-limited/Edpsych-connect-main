'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus, X, Check } from 'lucide-react';
import ContactProfessionalForm from './ContactProfessionalForm';
import { sendConnectionRequest } from '@/actions/network-actions';
import { useToast } from '@/hooks/use-toast';

interface ProfileActionsProps {
  professionalId: string;
  professionalName: string;
}

export function ProfileActions({ professionalId, professionalName }: ProfileActionsProps) {
  const [showContact, setShowContact] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await sendConnectionRequest(professionalId);
      
      if (result.success) {
        setIsConnected(true);
        toast({
          title: "Connection Request Sent",
          description: `A request has been sent to ${professionalName}.`,
        });
      } else {
        toast({
          title: "Request Failed",
          description: result.error || "Could not send request.",
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 w-full md:w-auto">
        <Button variant="default" className="w-full md:w-auto gap-2" onClick={() => setShowContact(true)}>
             <MessageSquare className="w-4 h-4" />
             Message
        </Button>
        <Button 
          variant="outline" 
          className="w-full md:w-auto gap-2"
          onClick={handleConnect}
          disabled={isConnecting || isConnected}
        >
            {isConnected ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isConnected ? 'Pending' : 'Connect'}
        </Button>
      </div>

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900">Message {professionalName}</h3>
              <button 
                onClick={() => setShowContact(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <ContactProfessionalForm 
                professionalId={professionalId}
                professionalName={professionalName}
                onSuccess={() => setTimeout(() => setShowContact(false), 2000)}
                onCancel={() => setShowContact(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
