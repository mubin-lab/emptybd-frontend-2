const fs = require('fs');
const file = 'src/app/(main-layout)/news/AllNews.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  // Infinite scroll with scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 150
      ) {
        if (!loading && hasMore && !isFetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);`;

const replacement = `  // Infinite scroll with scroll event
  useEffect(() => {
    let throttleTimeout = null;
    const handleScroll = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 250
        ) {
          if (!loading && hasMore && !isFetchingRef.current) {
            setPage((prev) => prev + 1);
          }
        }
        throttleTimeout = null;
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);`;

if (content.includes(target)) {
  fs.writeFileSync(file, content.replace(target, replacement), 'utf8');
  console.log('Successfully replaced scroll logic in AllNews.tsx');
} else {
  console.log('Target block not found in AllNews.tsx');
}
