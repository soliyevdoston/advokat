# Advokat Frontend

Bu loyiha frontend qismi bo'lib, backend API bilan ishlashga moslangan.

## 1) Sozlash

`.env` fayl oching (yoki `.env.example`dan nusxa oling):

```env
VITE_API_BASE_URL=https://advokat-1.onrender.com
VITE_ENABLE_LOCAL_FALLBACK=false
VITE_SOCKET_BASE_URL=https://advokat-1.onrender.com
VITE_SOCKET_PATH=/socket.io
```

`VITE_API_BASE_URL` backendingizning asosiy URL manzili bo'lishi kerak.
`VITE_SOCKET_BASE_URL` Socket.IO server origini (odatda backend URL bilan bir xil).

## 2) Ishga tushirish

```bash
npm install
npm run dev
```

Frontend Vite serveri `http://127.0.0.1:5173` portda ishga tushadi.

Faqat `http://127.0.0.1:5173` URLdan oching. `localhost` emas, aynan `127.0.0.1` ishlating.
HMR websocket xato bersa, boshqa Vite processlarni to'xtatib (`pkill -f vite`) qayta `npm run dev` qiling.

## 3) Build

```bash
npm run build
```

## Eslatma

- `VITE_ENABLE_LOCAL_FALLBACK=false` bo'lsa, frontend faqat backend javoblariga tayanadi.
- Auth, admin, mijozlar va chat oqimi backend endpointlar bilan ishlaydi.
