import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, CheckCircle, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitVerificationModal({ open, onClose, listing, user }) {
  const [verificationType, setVerificationType] = useState('full');
  const [ownershipDocs, setOwnershipDocs] = useState([]);
  const [identityDocs, setIdentityDocs] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const queryClient = useQueryClient();

  const submitVerificationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.VerificationRequest.create(data);
    },
    onSuccess: async () => {
      // Update listing verification status to pending
      await base44.entities.Listing.update(listing.id, {
        verification_status: 'pending'
      });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    },
  });

  const handleFileUpload = async (files, type) => {
    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        toast.error('Failed to upload file');
      }
    }

    if (type === 'ownership') {
      setOwnershipDocs([...ownershipDocs, ...uploadedUrls]);
    } else {
      setIdentityDocs([...identityDocs, ...uploadedUrls]);
    }

    setUploading(false);
  };

  const removeDocument = (url, type) => {
    if (type === 'ownership') {
      setOwnershipDocs(ownershipDocs.filter(doc => doc !== url));
    } else {
      setIdentityDocs(identityDocs.filter(doc => doc !== url));
    }
  };

  const handleSubmit = () => {
    if (verificationType === 'full' && (!ownershipDocs.length || !identityDocs.length)) {
      toast.error('Please upload both ownership and identity documents');
      return;
    }
    if (verificationType === 'ownership' && !ownershipDocs.length) {
      toast.error('Please upload ownership documents');
      return;
    }
    if (verificationType === 'identity' && !identityDocs.length) {
      toast.error('Please upload identity documents');
      return;
    }

    submitVerificationMutation.mutate({
      listing_id: listing.id,
      host_email: user.email,
      verification_type: verificationType,
      ownership_documents: ownershipDocs,
      identity_documents: identityDocs,
      additional_notes: additionalNotes,
      status: 'pending',
    });
  };

  const resetForm = () => {
    setVerificationType('full');
    setOwnershipDocs([]);
    setIdentityDocs([]);
    setAdditionalNotes('');
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Verification Submitted!
            </h3>
            <p className="text-slate-600">
              Your verification request has been submitted for review
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF5124]" />
            Submit Listing Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-900">
              Verified listings receive a trust badge and are prioritized in search results. Upload clear photos of your documents.
            </AlertDescription>
          </Alert>

          {/* Listing Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-slate-900">{listing.title}</h3>
            <p className="text-sm text-slate-600">{listing.public_location_label}</p>
          </div>

          {/* Verification Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Verification Type</Label>
            <RadioGroup value={verificationType} onValueChange={setVerificationType}>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="full" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Full Verification</p>
                    <p className="text-sm text-slate-600">Ownership + Identity (Recommended)</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="ownership" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Ownership Only</p>
                    <p className="text-sm text-slate-600">Proof of asset ownership</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="identity" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Identity Only</p>
                    <p className="text-sm text-slate-600">Government ID verification</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Ownership Documents */}
          {(verificationType === 'full' || verificationType === 'ownership') && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Ownership Documents *
              </Label>
              <p className="text-xs text-slate-500 mb-3">
                Upload title, registration, or purchase receipt
              </p>
              <div className="space-y-3">
                {ownershipDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700 flex-1 truncate">Document {idx + 1}</span>
                    <button
                      onClick={() => removeDocument(doc, 'ownership')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFileUpload(Array.from(e.target.files), 'ownership')}
                    className="sr-only"
                    disabled={uploading}
                  />
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {uploading ? 'Uploading...' : 'Upload Documents'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Identity Documents */}
          {(verificationType === 'full' || verificationType === 'identity') && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Identity Documents *
              </Label>
              <p className="text-xs text-slate-500 mb-3">
                Upload government-issued ID (Driver's License, Passport, etc.)
              </p>
              <div className="space-y-3">
                {identityDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700 flex-1 truncate">Document {idx + 1}</span>
                    <button
                      onClick={() => removeDocument(doc, 'identity')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFileUpload(Array.from(e.target.files), 'identity')}
                    className="sr-only"
                    disabled={uploading}
                  />
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {uploading ? 'Uploading...' : 'Upload Documents'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional information to help with verification..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitVerificationMutation.isPending || uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitVerificationMutation.isPending || uploading}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {submitVerificationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}