import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Rendu markdown commun : liens externes sécurisés, reste par défaut. */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        // Le titre est affiché à part : un h1 dans le corps ferait doublon.
        h1: ({ children }) => <h2>{children}</h2>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
