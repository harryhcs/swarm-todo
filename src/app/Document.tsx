import type { DocumentProps } from "rwsdk/worker";
import styles from "@/styles.css?url";

export function Document({ children }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Todos</title>
        <link rel="stylesheet" href={styles} />
      </head>
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
        <script type="module" src="rwsdk_asset:/src/client.tsx" />
      </body>
    </html>
  );
}
