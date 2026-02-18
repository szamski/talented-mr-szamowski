export default function BlogLoading() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 animate-fade-in">
      {/* Header */}
      <div className="skeleton h-12 w-32 mb-4" />
      <div className="skeleton h-4 w-80 mb-10" />

      {/* Blog card skeletons */}
      <div className="grid gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass p-6 space-y-3">
            <div className="flex gap-3">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-3 w-24 mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}
