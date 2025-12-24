import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileCompletionStep({ user, onComplete, onSkip }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
  });

  const generateBioMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate a professional, friendly bio for a host on a food truck/equipment rental marketplace.
      
      Host name: ${formData.full_name || 'Host'}
      ${formData.business_name ? `Business: ${formData.business_name}` : ''}
      
      The bio should:
      - Be 80-120 words
      - Sound authentic and welcoming
      - Highlight experience in food service or hospitality
      - Mention reliability and customer satisfaction
      - End with enthusiasm about helping customers succeed
      
      Write in first person, friendly but professional tone.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      return response;
    },
    onSuccess: (bio) => {
      setFormData(prev => ({ ...prev, bio }));
      toast.success('AI bio generated!');
    },
    onError: () => {
      toast.error('Failed to generate bio');
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      return await base44.auth.updateMe({
        full_name: formData.full_name,
        bio: formData.bio,
        phone: formData.phone,
        business_name: formData.business_name,
      });
    },
    onSuccess: () => {
      toast.success('Profile updated!');
      onComplete();
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const canSubmit = formData.full_name && formData.bio;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Complete Your Profile
        </CardTitle>
        <p className="text-sm text-slate-500">Help guests get to know you</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-purple-50 border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            A complete profile builds trust with guests and increases booking rates by up to 40%!
          </AlertDescription>
        </Alert>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="John Doe"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label>Business Name (Optional)</Label>
          <Input
            value={formData.business_name}
            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
            placeholder="e.g., Phoenix Food Trucks LLC"
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>About You *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => generateBioMutation.mutate()}
              disabled={!formData.full_name || generateBioMutation.isPending}
              className="gap-2"
            >
              {generateBioMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell guests about yourself and your experience... or let AI write it for you!"
            className="min-h-[120px]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Share your experience, what you offer, and why guests should choose you
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={() => saveProfileMutation.mutate()}
            disabled={!canSubmit || saveProfileMutation.isPending}
            className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}