function UserStatsCard({ title, user }: { title: string; user: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-3xl font-bold">{user || 0}</p>
      </div>
    </div>
  );
}

export default UserStatsCard;
