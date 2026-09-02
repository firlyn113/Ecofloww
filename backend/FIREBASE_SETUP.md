# INSTRUKSI SETUP FIREBASE AUTHENTICATION

## Cara Mendapatkan Firebase Credentials:
1. Buka **Firebase Console**: https://console.firebase.google.com/
2. Pilih project **EcoFlow AI**
3. Buka **Project Settings** (ikon gear di kiri atas)
4. Klik tab **Service Accounts**
5. Klik **Generate New Private Key**
6. Download file JSON dan simpan sebagai `firebase-credentials.json` di folder `/backend/`

## Struktur File Credentials Asli:
```json
{
  "type": "service_account",
  "project_id": "ecoflow-ai-[id-proyek-anda]",
  "private_key_id": "[64-character-id]",
  "private_key": "-----BEGIN PRIVATE KEY-----\n[private-key-content]\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-[random]@ecoflow-ai-[id-proyek].iam.gserviceaccount.com",
  "client_id": "[client-id]",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-[random]%40ecoflow-ai-[id-proyek].iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## Catatan Pengembangan:
- File `firebase-credentials.json` saat ini adalah **placeholder** untuk pengembangan
- Di environment development, aplikasi akan berjalan dengan dummy user tanpa Firebase
- Untuk production, file credentials asli **WAJIB** disediakan
- Jangan commit file credentials ke repository!