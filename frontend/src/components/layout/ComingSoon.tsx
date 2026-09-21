export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">This section is planned for a later development phase.</p>
    </div>
  );
}
