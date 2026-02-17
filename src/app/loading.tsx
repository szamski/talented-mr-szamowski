// Shown instantly by Next.js App Router while the home page fetches data.
// Matches the rough layout of the page so there's no jarring layout shift.
export default function HomeLoading() {
  return (
    <div className="animate-fade-in">
      {/* Hero skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-14 w-3/4" />
            <div className="skeleton h-8 w-1/2" />
            <div className="skeleton h-20 w-full" />
            <div className="flex gap-4 pt-2">
              <div className="skeleton h-10 w-28" />
              <div className="skeleton h-10 w-28" />
            </div>
          </div>
          <div className="skeleton h-72 w-72 rounded-full flex-shrink-0" />
        </div>
      </section>

      {/* About skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-full" />
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </section>

      {/* Experience skeleton */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="skeleton h-8 w-52 mb-10" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8 pl-6 border-l border-brand/10">
            <div className="skeleton h-5 w-1/3 mb-2" />
            <div className="skeleton h-4 w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
              <div className="skeleton h-3 w-4/6" />
            </div>
          </div>
        ))}
      </section>

      {/* Skills skeleton */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${60 + (i % 5) * 20}px` }} />
          ))}
        </div>
      </section>
    </div>
  );
}
