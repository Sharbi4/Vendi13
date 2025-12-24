import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATE_CATEGORIES = [
  { value: 'booking_confirmation', label: 'Booking Confirmation', color: 'bg-green-100 text-green-800' },
  { value: 'check_in', label: 'Check-In Instructions', color: 'bg-blue-100 text-blue-800' },
  { value: 'check_out', label: 'Check-Out Instructions', color: 'bg-purple-100 text-purple-800' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
  { value: 'custom', label: 'Custom', color: 'bg-amber-100 text-amber-800' },
];

export default function TemplatesManager({ userEmail, onSelectTemplate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message-templates', userEmail],
    queryFn: async () => {
      return await base44.entities.MessageTemplate.filter({ host_email: userEmail }, '-created_date');
    },
    enabled: !!userEmail,
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data) => {
      if (editingTemplate) {
        return await base44.entities.MessageTemplate.update(editingTemplate.id, data);
      }
      return await base44.entities.MessageTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['message-templates']);
      setShowModal(false);
      setEditingTemplate(null);
      toast.success(editingTemplate ? 'Template updated' : 'Template created');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.MessageTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['message-templates']);
      toast.success('Template deleted');
    },
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleUseTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.message_text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Quick Reply Templates</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingTemplate(null);
            setShowModal(true);
          }}
          className="bg-[#FF5124] hover:bg-[#e5481f]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No templates yet. Create one to save time!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {templates.filter(t => t.is_active).map((template) => {
            const category = TEMPLATE_CATEGORIES.find(c => c.value === template.category);
            return (
              <Card key={template.id} className="hover:border-[#FF5124] transition-colors cursor-pointer">
                <CardContent className="p-4" onClick={() => handleUseTemplate(template)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{template.title}</h4>
                        <Badge className={`${category?.color} text-xs border-0`}>
                          {category?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{template.message_text}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TemplateModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        userEmail={userEmail}
        onSave={(data) => saveTemplateMutation.mutate(data)}
        isLoading={saveTemplateMutation.isPending}
      />
    </div>
  );
}

function TemplateModal({ open, onClose, template, userEmail, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    message_text: template?.message_text || '',
    category: template?.category || 'general',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.message_text) {
      toast.error('Please fill in all fields');
      return;
    }

    onSave({
      host_email: userEmail,
      ...formData,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Booking Confirmation"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={formData.message_text}
              onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
              placeholder="Hi [Guest Name], thank you for booking..."
              className="mt-2 min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use placeholders like [Guest Name], [Listing], [Date] for personalization
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {isLoading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}