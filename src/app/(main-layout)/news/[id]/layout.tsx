import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/news/${id}`);
    
    if (!res.ok) {
      return {
        title: 'খবর পাওয়া যায়নি | EmptyBD',
      };
    }

    const news = await res.json();
    
    // Attempt to extract a clean string from the markdown description if it's not an object
    let desc = 'EmptyBD-তে এই খবরটি পড়ুন।';
    if (typeof news.news_description === 'string') {
      // Remove basic markdown chars for meta description
      desc = news.news_description.replace(/[#*`>]/g, '').substring(0, 160).trim();
    }
    
    return {
      title: `${news.title || 'খবর'} | EmptyBD`,
      description: desc,
      openGraph: {
        title: `${news.title || 'খবর'} | EmptyBD`,
        description: desc,
        images: news.news_img ? [{ url: news.news_img }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'খবর | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
