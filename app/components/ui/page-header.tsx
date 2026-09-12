type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      )}
    </>
  );
}
