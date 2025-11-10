"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dropService } from "@/services/dropService";
import { Drop } from "@/types";
import toast from "react-hot-toast";
import { Loader2, PackageCheck, Timer, AlertCircle, LogOut } from "lucide-react";

export default function DropDetailPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // State for success results
  const [waitlistScore, setWaitlistScore] = useState<number | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDrop();
      if (user) loadMyStatus();
    }
  }, [id, user]);

  async function loadMyStatus() {
    try {
      const status = await dropService.getMyStatus(Number(id));
      setWaitlistScore(status.score);
      setClaimCode(status.claim_code);
    } catch (error) {
      console.error("Failed to load status", error);
    }
  }

  async function loadDrop() {
    try {
      const data = await dropService.getById(Number(id));
      setDrop(data);
    } catch (error) {
      toast.error("Could not load drop details");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinWaitlist() {
    if (!user) return router.push("/login");
    setIsJoining(true);
    try {
      const res = await dropService.joinWaitlist(Number(id));
      setWaitlistScore(res.score);
      toast.success("Joined waitlist!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join waitlist");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleLeaveWaitlist() {
    if (!confirm("Are you sure you want to leave the waitlist? You will lose your spot!")) return;
    setIsJoining(true);
    try {
      await dropService.leaveWaitlist(Number(id));
      setWaitlistScore(null); // Clear score from state
      toast.success("Left waitlist");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsJoining(false);
    }
  }

  async function handleClaim() {
    if (!user) return router.push("/login");
    setIsJoining(true);
    try {
      const res = await dropService.claim(Number(id));
      setClaimCode(res.claim_code);
      toast.success("CLAIM SUCCESSFUL!");
      loadDrop();
    } catch (error: any) {
      toast.error(error.message || "Claim failed");
    } finally {
      setIsJoining(false);
    }
  }

  if (isLoading || authLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!drop) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full 
                        ${drop.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
            {drop.status.toUpperCase()}
          </span>
          <h1 className="text-4xl font-bold mt-4 mb-2">{drop.name}</h1>
          <p className="text-gray-600 text-lg">{drop.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-500 mb-1">Starts At</p>
            <p className="font-medium">{new Date(drop.starts_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Stock Remaining</p>
            <p className="font-medium text-xl">{drop.stock_count}</p>
          </div>
        </div>

        {/* SUCCESS STATES */}
        {claimCode && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center animate-bounce-in">
            <PackageCheck className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-green-800 mb-2">CLAIM SUCCESSFUL!</h3>
            <p className="text-sm text-green-700 mb-2">Save your claim code:</p>
            <code className="block bg-white p-3 rounded border-2 border-dashed border-green-300 text-2xl font-mono tracking-wider select-all">
              {claimCode}
            </code>
          </div>
        )}

        {/* STATE 2: ON WAITLIST */}
        {waitlistScore !== null && !claimCode && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            {/* Left side: Score Info */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full border-2 border-blue-100">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-lg">You are on the waitlist</h3>
                <p className="text-blue-700 font-medium flex items-center gap-2">
                  Priority Score:
                  <span className="font-mono bg-blue-600 text-white px-2 py-0.5 rounded text-md">{waitlistScore}</span>
                </p>
              </div>
            </div>

            {/* Right side: Leave Button */}
            <button
              onClick={handleLeaveWaitlist}
              disabled={isJoining}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-white border-2 border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50"
              title="Leave the waitlist and lose your spot">
              {isJoining ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Leave Waitlist
                </>
              )}
            </button>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-8">
          {!user ? (
            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
              Login to Participate
            </button>
          ) : (
            <>
              {/* SHOW JOIN BUTTON IF: (Upcoming OR Active) AND (Not yet in waitlist) */}
              {(drop.status === "upcoming" || drop.status === "active") && waitlistScore === null && (
                <button
                  onClick={handleJoinWaitlist}
                  disabled={isJoining}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 flex justify-center">
                  {isJoining ? <Loader2 className="animate-spin" /> : "Join Waitlist to Qualify"}
                </button>
              )}

              {/* SHOW CLAIM BUTTON IF: Active AND Joined Waitlist AND Not Claimed Yet */}
              {drop.status === "active" && waitlistScore !== null && !claimCode && (
                <button
                  onClick={handleClaim}
                  disabled={isJoining || drop.stock_count < 1}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 flex justify-center mt-4">
                  {isJoining ? <Loader2 className="animate-spin" /> : drop.stock_count > 0 ? "CLAIM NOW ⚡" : "SOLD OUT"}
                </button>
              )}

              {drop.status === "ended" && (
                <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Drop Ended
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
