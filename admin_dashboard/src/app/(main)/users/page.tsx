import { UsersTable } from "@/components/Tables/UsersTable";

function UsersPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all registered users
        </p>
      </div>
      <UsersTable />
    </main>
  );
}

export default UsersPage;
