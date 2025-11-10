"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Drop } from "@/types";
import { Loader2, Clock, Package } from "lucide-react";
import { dropService } from "@/services/dropService";

export default function HomePage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDrops() {
      try {
        const data = await dropService.getAllPublic();
        setDrops(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDrops();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  return (
    <div>
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Next Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Drops</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Secure your spot for exclusive limited releases. Join the waitlist, earn your score, and claim before it's gone.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drops.map(drop => (
          <Link href={`/drops/${drop.id}`} key={drop.id} className="group">
            <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-lg">{drop.name}</h2>
                  <Badge status={drop.status} />
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{drop.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {drop.status === "upcoming"
                      ? `Starts: ${new Date(drop.starts_at).toLocaleDateString()}`
                      : `${drop.stock_count} items remaining`}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {drops.length === 0 && !isLoading && (
        <div className="text-center py-20 text-gray-500">No active drops right now. Check back later!</div>
      )}
    </div>
  );
}

function Badge({ status }: { status: Drop["status"] }) {
  const styles = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    ended: "bg-gray-100 text-gray-800",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status.toUpperCase()}</span>;
}
