"use client";

import { useEffect, useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import type { ManagedUser } from "./types";
import NewUserForm from "./NewUserForm";
import UserRow from "./UserRow";
import {
  Card,
  PageContainer,
  PageHeader,
  btnPrimary,
  btnSecondary,
  tableHead,
} from "../components/ui";

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
    <PageContainer width="max-w-6xl">
        <PageHeader
          title="User Management"
          subtitle="Manage user accounts, roles, and access."
          actions={
            <button onClick={() => setShowForm((v) => !v)} className={btnPrimary}>
              <UserPlus size={16} />
              New User
            </button>
          }
        />

        {showForm && (
          <NewUserForm
            onCreated={() => {
              setShowForm(false);
              fetchUsers();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <AlertCircle size={24} className="text-red-500" />
                        <p className="text-slate-900">Unable to load users.</p>
                        <button
                          onClick={fetchUsers}
                          className={btnSecondary}
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
        </Card>
    </PageContainer>
  );
}
