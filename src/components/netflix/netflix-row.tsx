export function NetflixRow({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="text-white text-lg font-semibold mb-3 px-6 md:px-12">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-6 md:px-12 pb-4 scrollbar-none">
        {children}
      </div>
    </section>
  )
}
