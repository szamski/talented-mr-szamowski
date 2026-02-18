interface Client {
  name: string;
  logo: { url: string; alt: string };
  url?: string;
}

interface ClientsSectionProps {
  clients: Client[];
}

const PLACEHOLDER_CLIENTS: Client[] = [
  { name: "TikTok", logo: { url: "", alt: "TikTok" } },
  { name: "Ubisoft", logo: { url: "", alt: "Ubisoft" } },
  { name: "Samsung", logo: { url: "", alt: "Samsung" } },
  { name: "Foap", logo: { url: "", alt: "Foap" } },
  { name: "Selmo", logo: { url: "", alt: "Selmo" } },
  { name: "ISART Digital", logo: { url: "", alt: "ISART Digital" } },
];

export default function ClientsSection({ clients }: ClientsSectionProps) {
  const displayClients = clients.length > 0 ? clients : PLACEHOLDER_CLIENTS;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <h2 className="text-3xl sm:text-4xl font-bold mb-10">
        Proven in <span className="text-gradient">High-Stakes Operations</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
        {displayClients.map((client) => {
          const content = client.logo.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={client.logo.url}
              alt={client.logo.alt}
              className="h-10 w-auto max-w-full client-logo"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-600 group-hover:text-brand transition-colors duration-500 tracking-wide uppercase">
              {client.name}
            </span>
          );

          const className =
            "group flex items-center justify-center h-16 transition-all duration-500";

          if (client.url) {
            return (
              <a
                key={client.name}
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <div key={client.name} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
