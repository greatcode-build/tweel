import Image from "next/image";
import Link from "next/link";

interface ArticleProps {
  title: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  source: { name: string };
}

interface NewsProps {
  article: ArticleProps;
}

export default function News({ article }: NewsProps) {
  if (!article.url || !article.urlToImage) return null;

  return (
    <Link href={article.url} target="_blank">
      <div className="flex items-center justify-center px-4 py-2 space-x-1 hover:bg-gray-200 transition duration-500 ease-out">
        <div className="space-y-0.5">
          <h6 className="text-sm font-bold">{article.title}</h6>
          <p className="text-xs font-medium text-gray-500">
            {article.source.name}
          </p>
        </div>
        <Image
          src={article.urlToImage}
          alt="news image"
          width={70}
          height={70}
          className="rounded-xl"
        />
      </div>
    </Link>
  );
}
