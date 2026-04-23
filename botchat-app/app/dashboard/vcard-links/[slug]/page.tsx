import VcardEditorClient from "./VcardEditorClient";

export default async function VcardEditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <VcardEditorClient slug={slug} />;
}
