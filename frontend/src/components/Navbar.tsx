"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Shield, Home } from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, logout, isLoading } = useAuth();

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo / Home Link */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
          DropSpot
        </Link>

        {/* Nav Links & User Status */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            <>
              {/* Home Link */}
              <Link href="/" className="text-gray-600 hover:text-black flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              {/* Admin Link (Admin Only) */}
              {isAdmin && (
                <Link href="/admin" className="text-red-600 hover:text-red-800 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* User Email */}
              <span className="hidden md:inline text-sm text-gray-500">{user.email}</span>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Logged Out Links */}
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
