export default function CaseStudiesLoading() {
  return (
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-20 animate-fade-in">
      {/* Header */}
      <div className="skeleton h-12 w-56 mb-4" />
      <div className="skeleton h-4 w-96 mb-10" />

      {/* Card grid skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass overflow-hidden">
            {/* Thumbnail */}
            <div className="skeleton h-44 w-full rounded-none" />
            <div className="p-6 space-y-3">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="flex gap-2 mt-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
