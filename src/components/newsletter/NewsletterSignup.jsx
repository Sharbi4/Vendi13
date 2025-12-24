import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interest, setInterest] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setErrorMessage('');

    try {
      // Save to database
      await base44.entities.NewsletterSubscriber.create({
        email,
        name,
        interest,
        subscribed: true,
      });

      // Sync to Google Sheets
      try {
        await base44.functions.invoke('syncToGoogleSheets', {
          spreadsheetId: '1vxWIUu--n4vr1VDw8KYSvSSXjVDmkQsU6PZs6K7yAJs',
          sheetName: 'Newsletter Subscribers',
          data: [[
            new Date().toISOString(),
            name,
            email,
            interest,
          ]],
        });
      } catch (sheetsError) {
        console.error('Google Sheets sync failed:', sheetsError);
        // Don't fail the whole operation if Sheets sync fails
      }

      setStatus('success');
      setEmail('');
      setName('');
      setInterest('general');

      // Reset success message after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setStatus('error');
      setErrorMessage('Failed to sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're subscribed! 🎉</h3>
            <p className="text-slate-600">
              Check your inbox for updates and exclusive offers from Vendibook.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-[#FF5124]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Stay in the Loop</h3>
              <p className="text-slate-600">
                Get the latest listings, tips, and exclusive deals delivered to your inbox
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newsletter_name">Name</Label>
                <Input
                  id="newsletter_name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="newsletter_email">Email *</Label>
                <Input
                  id="newsletter_email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newsletter_interest">I'm interested in</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger id="newsletter_interest" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Updates</SelectItem>
                  <SelectItem value="renting">Renting Assets</SelectItem>
                  <SelectItem value="buying">Buying Equipment</SelectItem>
                  <SelectItem value="hosting">Becoming a Host</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe to Newsletter'
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}