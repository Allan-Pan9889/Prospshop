interface PageTitleProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageTitle({ title, breadcrumbs }: PageTitleProps) {
  return (
    <div className="page-title-bar">
      <div className="container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                {crumb.href ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-sep"> / </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
    </div>
  );
}
