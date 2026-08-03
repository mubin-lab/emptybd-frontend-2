import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const email = decodeURIComponent(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/public/${encodeURIComponent(email)}`);
    
    if (!res.ok) {
      return {
        title: 'প্রোফাইল পাওয়া যায়নি | EmptyBD',
      };
    }

    const { user } = await res.json();
    
    return {
      title: `${user.name} এর প্রোফাইল | EmptyBD`,
      description: user.bio ? user.bio.substring(0, 160) : `EmptyBD-তে ${user.name} এর প্রোফাইল দেখুন - বাংলাদেশের শীর্ষস্থানীয় অনলাইন নিলাম এবং ই-কমার্স প্ল্যাটফর্ম।`,
      openGraph: {
        title: `${user.name} এর প্রোফাইল | EmptyBD`,
        description: user.bio ? user.bio.substring(0, 160) : `EmptyBD-তে ${user.name} এর প্রোফাইল দেখুন।`,
        images: user.img ? [{ url: user.img }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'ইউজার প্রোফাইল | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
