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
        title: 'ডিজিটাল সম্পদ ক্রয় | EmptyBD',
      };
    }

    const { asset } = await res.json();
    
    return {
      title: `${asset.title} ক্রয় করুন | EmptyBD`,
      description: `EmptyBD-তে ${asset.title} এর ক্রয় সম্পন্ন করুন।`,
      openGraph: {
        title: `${asset.title} ক্রয় করুন | EmptyBD`,
        description: `EmptyBD-তে ${asset.title} এর ক্রয় সম্পন্ন করুন।`,
      },
    };
  } catch (error) {
    return {
      title: 'ক্রয় | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
