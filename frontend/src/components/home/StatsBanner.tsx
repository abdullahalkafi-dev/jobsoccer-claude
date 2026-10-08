export function StatsBanner() {
  const stats = [
    {
      value: "250M+",
      label: "Soccer Players Worldwide",
    },
    {
      value: "300,000+",
      label: "Clubs Globally",
    },
    {
      value: "$60 Billion",
      label: "Global Soccer Industry",
    },
  ];

  return (
    <section>
      {/* Yellow Banner Header */}
      <div className="py-8 text-center bg-primary mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          The Soccer World is Massive. We Connect It.
        </h2>
      </div>
      <div className="bg-[#252525] py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-center py-8 md:py-4 px-8 text-center"
              >
                <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2">
                  {stat.value}
                </span>
                <span className="text-sm md:text-base text-white/70 uppercase tracking-widest font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
