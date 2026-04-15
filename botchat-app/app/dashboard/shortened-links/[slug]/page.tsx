import EditorClient from "./EditorClient";
import { SEEDED_SLUGS } from "./data";

type Params = { params: any };

export function generateStaticParams() {
    return SEEDED_SLUGS.map((slug) => ({ slug }));
}

export default async function Page({ params }: Params) {
    const p = await params;
    return <EditorClient slug={p.slug} />;
}
