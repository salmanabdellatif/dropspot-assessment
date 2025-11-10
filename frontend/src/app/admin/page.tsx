"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dropService } from "@/services/dropService";
import { Drop } from "@/types";
import toast from "react-hot-toast";
import { Plus, Trash2, Loader2, Edit } from "lucide-react";
import DropForm from "@/components/DropForm";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) loadDrops();
  }, [isAdmin]);

  async function loadDrops() {
    try {
      const data = await dropService.adminGetAll();
      setDrops(data);
    } catch (error) {
      toast.error("Failed to load drops");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateOrUpdate(data: Partial<Drop>) {
    try {
      if (editingDrop) {
        await dropService.update(editingDrop.id, data);
        toast.success("Drop updated successfully");
      } else {
        await dropService.create(data);
        toast.success("Drop created successfully");
      }
      // Reset and reload
      setShowForm(false);
      setEditingDrop(null);
      loadDrops();
    } catch (error: any) {
      // Cast error safely or rely on message if it exists
      toast.error(error.message || "Operation failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this drop?")) return;
    try {
      await dropService.delete(id);
      toast.success("Drop deleted");
      loadDrops();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  }

  if (authLoading || isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800">
            <Plus className="w-4 h-4" /> New Drop
          </button>
        )}
      </div>

      {/* SHOW FORM IF TOGGLED */}
      {showForm ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingDrop ? "Edit Drop" : "Create New Drop"}</h2>
          <DropForm
            initialData={editingDrop || {}}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowForm(false);
              setEditingDrop(null);
            }}
          />
        </div>
      ) : (
        // SHOW TABLE IF NO FORM
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drops.map(drop => (
                <tr key={drop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{drop.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full 
                                            ${
                                              drop.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : drop.status === "upcoming"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                      {drop.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{drop.stock_count}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingDrop(drop);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(drop.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {drops.length === 0 && <div className="p-8 text-center text-gray-500">No drops found.</div>}
        </div>
      )}
    </div>
  );
}
