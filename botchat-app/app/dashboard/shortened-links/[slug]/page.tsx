import EditorClient from "./EditorClient";

export async function generateStaticParams() {
    try {
        const res = await fetch("http://localhost:3001/api/v1/links", { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return (data?.data ?? []).map((link: any) => ({ slug: link.url }));
    } catch {
        // Backend not available at build time — page fetches data client-side
        return [];
    }
}

type Params = { params: any };

export default async function Page({ params }: Params) {
    const p = await params;
    return <EditorClient slug={p.slug} />;
}
