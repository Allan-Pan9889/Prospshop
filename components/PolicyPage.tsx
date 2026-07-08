import PageTitle from "@/components/PageTitle";

interface PolicyPageProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyPage({ title, children }: PolicyPageProps) {
  return (
    <>
      <PageTitle
        title={title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <div className="content-page">
        <div className="container">
          <div className="content-body">{children}</div>
        </div>
      </div>
    </>
  );
}
