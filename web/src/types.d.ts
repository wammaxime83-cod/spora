import 'react';
declare module 'react' {
  // Autorise les variables CSS personnalisées (--d, --c1…) dans l'attribut style
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
}
