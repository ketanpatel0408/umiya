"use client";

import { useEffect, useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import type { ManagedUser } from "./types";
import NewUserForm from "./NewUserForm";
import UserRow from "./UserRow";

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUserId(data?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Request failed");
      const data: ManagedUser[] = await res.json();
      setUsers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              User Management
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage user accounts, roles, and access.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <UserPlus size={18} />
            New User
          </button>
        </div>

        {showForm && (
          <NewUserForm
            onCreated={() => {
              setShowForm(false);
              fetchUsers();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Full Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <AlertCircle size={24} className="text-red-500" />
                        <p className="text-zinc-900">Unable to load users.</p>
                        <button
                          onClick={fetchUsers}
                          className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  users.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      currentUserId={currentUserId}
                      onUpdated={fetchUsers}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
