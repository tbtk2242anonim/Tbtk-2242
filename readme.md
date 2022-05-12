
## Gereklilikler
- NodeJS versiyon 16.5.0 yada daha aşağısı 
- Hardhat

# Çalıştırmak için sırasıyla

### 1. Gerekli paketleri yükleme:

$ npm install

### 2. Yere blokzinciri ağını ayağa kaldırmak
$ npx hardhat node

### 3. Metamask cüdanınızı bu ağa bağlamak
- Size verline private keylerden birini kullanarak metamask içine hesap ekleyin.
- Metamask cüzdanına yeni bir ağı aşağıdaki özellikleri kullanarak ekleyin
  Ağ adı: HardHat 
  Yeni RPC URL adresi: http://127.0.0.1:8545
  Zincir Kimliği: 31337
  Para Birimi Sembolü: ETH

### 5. Kontratları ağda yayınlamak için aşağıdaki komutu kullanın
`npx hardhat run src/backend/scripts/deploy.js --network localhost`

### 6. Arayüzü başlatın
`$ npm run start`
