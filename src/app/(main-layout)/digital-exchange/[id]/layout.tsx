import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards/${id}`);
    
    if (!res.ok) {
      return {
        title: 'ডিজিটাল সম্পদ পাওয়া যায়নি | EmptyBD',
      };
    }

    const { asset } = await res.json();
    
    return {
      title: `${asset.title} - ডিজিটাল এক্সচেঞ্জ | EmptyBD`,
      description: asset.description ? asset.description.substring(0, 160) : 'EmptyBD ডিজিটাল এক্সচেঞ্জ থেকে এই ডিজিটাল সম্পদ কিনুন।',
      openGraph: {
        title: `${asset.title} - ডিজিটাল এক্সচেঞ্জ | EmptyBD`,
        description: asset.description ? asset.description.substring(0, 160) : 'EmptyBD ডিজিটাল এক্সচেঞ্জ থেকে এই ডিজিটাল সম্পদ কিনুন।',
        images: asset.image ? [{ url: asset.image }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'ডিজিটাল সম্পদ | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
