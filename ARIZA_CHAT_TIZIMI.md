# Ariza va Chat Tizimi

## 1. User chat oqimi
1. User AI chatga xabar yozadi.
2. Xabar local DB (`legallink_ai_chat_messages_v1`) va chat state'ga saqlanadi.
3. AI javobi olinadi:
   - Javob topilsa userga qaytariladi.
   - Javob topilmasa fallback xabar qaytariladi.
4. Ketma-ket 3 ta xatolik/no-answer bo'lsa `Ariza yaratish` tavsiyasi chiqadi.

## 2. User ariza yuborishi
1. User AI chatdan yoki Dashboarddan ariza yaratadi.
2. Ariza API endpointlarga yuboriladi (`/applications`, `/requests`, `/documents`, `/api/applications`).
3. API ishlamasa local fallback (`legallink_user_applications_v1`) saqlanadi.
4. Advokat tanlangan bo'lsa shu advokat biriktiriladi.
5. Tanlanmagan bo'lsa region + specialization bo'yicha default advokat tanlanadi.
6. Ariza yaratilgandan keyin chat conversation avtomatik yaratiladi.

## 3. Advokat ishlashi
1. Advokat paneli local/application oqimidan o'ziga biriktirilgan arizalarni oladi.
2. Request chatini ochadi.
3. Chatga javob yozadi.
4. Xabar `senderRole/senderType = lawyer` bilan saqlanadi.

## 4. Admin nazorati
1. Admin barcha ariza/chatlarni ko'radi.
2. Userlarni `block/unblock` qiladi.
3. Chat approval va status (open/closed) nazorati mavjud.
4. Audit logga asosiy admin amallari yoziladi.

## 5. Oqim diagram
User -> AI Chat -> (Javob bor) -> User

User -> AI Chat -> (No-answer/xatolik) -> 3 marta -> Ariza tavsiyasi -> Ariza yaratish ->
Tanlangan/default advokat -> Chat yaratiladi -> Advokat javobi -> User

Admin -> Ariza/Chat nazorati + Block/Unblock

