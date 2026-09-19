type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-2 max-w-prose text-sm text-muted">{description}</p>}
    </>
  );
}
