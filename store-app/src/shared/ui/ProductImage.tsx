import { useState } from "react";

interface ProductImageProps {
  url?: string;
  alt: string;
  /** Clases extra para la img */
  imgClassName?: string;
  /** Variante de diseño del fallback */
  variant?: "card" | "detail";
}

const FALLBACK_BY_VARIANT = {
  card: {
    container: "from-emerald-900/20 to-zinc-800/40",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-600"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  detail: {
    container: "from-emerald-900/10 to-zinc-800/30",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-600"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
};

export function ProductImage({
  url,
  alt,
  imgClassName = "",
  variant = "card",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const fallback = FALLBACK_BY_VARIANT[variant];

  if (!url || url === "string" || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallback.container}`}
      >
        {fallback.icon}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`h-full w-full object-cover ${imgClassName}`.trim()}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
