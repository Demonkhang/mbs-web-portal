import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <title>Cổng thông tin điện tử MBS - TP.HCM</title>
        <meta name="description" content="Cổng thông tin điện tử Ban Quản lý các Khu liên hợp xử lý chất thải TP.HCM (MBS)" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
