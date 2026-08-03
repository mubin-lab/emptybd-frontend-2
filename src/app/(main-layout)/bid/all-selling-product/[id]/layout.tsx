import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/${id}`);
    
    if (!res.ok) {
      return {
        title: 'নিলাম পাওয়া যায়নি | EmptyBD',
      };
    }

    const bid = await res.json();
    
    return {
      title: `${bid.product.title} - লাইভ নিলাম | EmptyBD`,
      description: bid.product.description ? bid.product.description.substring(0, 160) : `EmptyBD-তে ${bid.product.title} এর উপর নিলাম করুন - বাংলাদেশের শীর্ষস্থানীয় অনলাইন নিলাম প্ল্যাটফর্ম।`,
      openGraph: {
        title: `${bid.product.title} - লাইভ নিলাম | EmptyBD`,
        description: bid.product.description ? bid.product.description.substring(0, 160) : `EmptyBD-তে ${bid.product.title} এর উপর নিলাম করুন।`,
        images: bid.product.media_url || bid.product.image_url ? [{ url: bid.product.media_url || bid.product.image_url }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'লাইভ নিলাম | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
