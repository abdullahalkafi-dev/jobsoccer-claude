interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgColor: string;
}

const UserInfoCard: React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  iconBgColor,
}) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
};

export default UserInfoCard;
