"use client";
import { useState } from "react";
import { Drop } from "@/types";
import { Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { aiService } from "@/services/aiService";

interface DropFormProps {
  initialData?: Partial<Drop>;
  onSubmit: (data: Partial<Drop>) => Promise<void>;
  onCancel: () => void;
}

export default function DropForm({ initialData, onSubmit, onCancel }: DropFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    stock_count: initialData?.stock_count || 0,
    status: initialData?.status || "upcoming",
    starts_at: initialData?.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : "",
    ends_at: initialData?.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : "",
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Ensure dates are in full ISO format for backend
      const payload = {
        ...formData,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
      };
      await onSubmit(payload as any); // Cast to any to avoid strict Partial<Drop> type issues for now
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error("Please enter a Drop Name first.");
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await aiService.generateDescription(formData.name);
      setFormData({ ...formData, description: res.description });
      toast.success("Description generated!");
    } catch (error: any) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg border">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Drop Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Description</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 disabled:opacity-50">
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate with AI
            </button>
          </div>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Click 'Generate with AI' or type here..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock Count</label>
          <input
            type="number"
            required
            min="0"
            className="w-full p-2 border rounded"
            value={formData.stock_count}
            onChange={e => setFormData({ ...formData, stock_count: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Starts At</label>
            <input
              type="datetime-local"
              required
              className="w-full p-2 border rounded"
              value={formData.starts_at}
              onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ends At</label>
            <input
              type="datetime-local"
              required
              className="w-full p-2 border rounded"
              value={formData.ends_at}
              onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded hover:bg-gray-800 disabled:bg-gray-400">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Drop
        </button>
      </div>
    </form>
  );
}
