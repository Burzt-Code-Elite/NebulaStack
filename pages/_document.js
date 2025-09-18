import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <style>{`
          #main-container {
            margin-top: 40px;
            margin-left: 8px;
            margin-right: 8px;
          }
          
          @media (min-width: 768px) {
            #main-container {
              margin-left: 30%;
              margin-right: 30%;
            }
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}