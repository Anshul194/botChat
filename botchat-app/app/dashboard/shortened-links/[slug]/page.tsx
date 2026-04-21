
type Params = { params: any };

export async function generateStaticParams() {
    // Fetch all links from your API
    const res = await fetch("http://localhost:3001/api/v1/links", { cache: "no-store" });
    const data = await res.json();
    // Return all slugs for static generation
    return data.data.map((link: any) => ({ slug: link.url }));
}

export default async function Page({ params }: Params) {
    const p = await params;
    return <EditorClient slug={p.slug} />;
}
