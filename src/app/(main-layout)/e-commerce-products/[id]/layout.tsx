import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/${id}`);
    
    if (!res.ok) {
      return {
        title: 'পণ্য পাওয়া যায়নি | EmptyBD',
      };
    }

    const product = await res.json();
    
    return {
      title: `${product.name} | EmptyBD`,
      description: product.description ? product.description.substring(0, 160) : 'EmptyBD-তে এই পণ্যটি কিনুন - বাংলাদেশের শীর্ষস্থানীয় অনলাইন নিলাম এবং ই-কমার্স প্ল্যাটফর্ম।',
      openGraph: {
        title: `${product.name} | EmptyBD`,
        description: product.description ? product.description.substring(0, 160) : 'EmptyBD-তে এই পণ্যটি কিনুন।',
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'পণ্য | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
