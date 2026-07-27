# Postiva 📝🐱

> Notlarımı, görevlerimi ve günlük planlarımı daha düzenli takip edebilmek için geliştirdiğim; sade, sıcak ve tamamen yerel çalışan bir Windows masaüstü uygulaması.

<p align="center">
  <strong>Pixel-art ruhu, modern masaüstü deneyimi ve tamamen sana ait veriler.</strong>
</p>

---

## Postiva nedir?

Postiva, günlük notlarımı ve yapmam gereken işleri tek bir yerde daha düzenli takip edebilmek için geliştirdiğim masaüstü not ve görev uygulamasıdır.

Bu projeyi hazır bir uygulamayı kopyalamak için değil; Electron, React ve Node.js tarafında kendimi geliştirirken gerçekten kullanabileceğim bir ürün ortaya çıkarmak için hazırladım. Projeyi geliştirirken sadece çalışmasına değil, düzenli bir mimariye, anlaşılır bir kullanıcı deneyimine ve verilerin güvenli biçimde saklanmasına da önem verdim.

Tasarım tarafında klasik ve ciddi not uygulamalarından biraz uzaklaşmak istedim. Bu nedenle koyu tema, yumuşak renkler, pixel-art detayları ve ekranda dolaşan küçük bir kediyle daha samimi bir deneyim oluşturdum.

**Postiva 1.0.0**, Windows için kurulabilir ve günlük kullanımda çalışır durumda olan ilk kararlı sürümdür.

---

## İndir

Postiva'nın güncel Windows sürümünü GitHub Releases sayfasından indirebilirsin:

**[Postiva'nın son sürümünü indir](https://github.com/237mrt/postiva/releases/latest)**

Kurulum dosyası:

```text
Postiva-Setup-1.0.0.exe
```

> Uygulama henüz dijital olarak imzalanmadığı için Windows SmartScreen ilk çalıştırmada uyarı gösterebilir. Bu durum uygulamanın bozuk olduğu anlamına gelmez.

---

## Neler yapabilirsin?

### Not ve görev yönetimi

- Yeni not oluşturabilirsin.
- Notları düzenleyebilir ve silebilirsin.
- Silinen notları çöp kutusundan geri yükleyebilirsin.
- Notları kalıcı olarak silebilirsin.
- Notlara renk, öncelik, son tarih ve saat ekleyebilirsin.
- Notları tamamlandı olarak işaretleyebilirsin.
- Önemli notları sabitleyebilirsin.
- Notlar arasında arama yapabilirsin.
- Notları farklı ölçütlere göre sıralayabilirsin.

### Akıllı görünümler

Postiva, notları durumlarına göre otomatik olarak ayırır:

- **Bugün**
- **Yaklaşanlar**
- **Gecikenler**
- **Tamamlananlar**
- **Çöp Kutusu**

Bu sayede hangi görevin ne zaman yapılması gerektiğini tek bakışta görebilirsin.

### Pano sistemi

- Kendine özel panolar oluşturabilirsin.
- Panoların adını, simgesini ve rengini değiştirebilirsin.
- Notları istediğin panoya bağlayabilirsin.
- Bir panoya tıkladığında yalnızca o panoya ait notları görebilirsin.
- Bir pano silindiğinde bağlı notlar kaybolmaz.

### Bildirimler

- Son tarihi gelen notlar için Windows masaüstü bildirimi alabilirsin.
- Postiva'nın kendine ait bildirim sesini kullanabilirsin.
- Bildirim sesini açıp kapatabilirsin.
- Ses seviyesini ayarlayabilirsin.
- Uygulama sistem tepsisindeyken bildirimler çalışmaya devam eder.

### Sistem tepsisi ve başlangıç ayarları

- Pencereyi kapattığında Postiva sistem tepsisinde çalışmaya devam edebilir.
- Tray ikonuna tıklayarak uygulamayı yeniden açabilirsin.
- Ayarlardan Windows açılışında otomatik başlatmayı etkinleştirebilirsin.
- Uygulamadan tamamen çıkmak için tray menüsünü kullanabilirsin.

### Yedekleme ve geri yükleme

- Tüm notlarını, panolarını ve ayarlarını tek bir yedek dosyasında saklayabilirsin.
- Daha önce oluşturduğun bir yedeği geri yükleyebilirsin.
- Geri yükleme başlamadan önce mevcut verilerin için otomatik kurtarma yedeği oluşturulur.
- Geçersiz veya bozuk yedek dosyaları uygulanmadan önce kontrol edilir.

---

## Postiva nasıl kullanılır?

### 1. Yeni not oluşturma

Ana ekrandaki **Yeni Not** düğmesine tıkla.

Ardından:

1. Not başlığını ve içeriğini yaz.
2. İstersen bir pano seç.
3. Not rengini belirle.
4. Öncelik seviyesini seç.
5. Son tarih ve saat ekle.
6. Kaydet.

Oluşturduğun not ana ekranda görünür.

### 2. Not düzenleme

Düzenlemek istediğin nota tıkla. Açılan pencereden başlık, içerik, renk, pano, öncelik ve tarih bilgilerini değiştirebilirsin.

### 3. Notu tamamlama

Not kartındaki tamamla düğmesini kullanarak görevi tamamlandı olarak işaretleyebilirsin. Tamamlanan notlar **Tamamlananlar** bölümüne taşınır.

### 4. Not silme ve geri yükleme

Bir notu sildiğinde doğrudan kaybolmaz; önce **Çöp Kutusu** bölümüne gider.

Çöp kutusunda:

- Notu geri yükleyebilirsin.
- Kalıcı olarak silebilirsin.

### 5. Pano oluşturma

Sol menüdeki pano ekleme seçeneğini kullan.

Pano oluştururken:

- Pano adı
- Simge
- Renk

belirleyebilirsin.

Daha sonra not oluştururken bu panoyu seçebilirsin.

### 6. Yedek oluşturma

**Ayarlar → Veri Yedekleme → Yedek Oluştur** adımlarını takip et.

Postiva, notlarını, panolarını ve ayarlarını içeren bir JSON yedek dosyası oluşturur.

### 7. Yedek geri yükleme

**Ayarlar → Veri Yedekleme → Yedeği Geri Yükle** seçeneğini kullan.

Geri yükleme işleminden önce bir onay ekranı gösterilir. İşlem başladığında mevcut verilerin ayrıca otomatik kurtarma yedeğine alınır.

---

## Veriler nerede saklanıyor?

Postiva tamamen yerel çalışır.

- Kullanıcı hesabı gerektirmez.
- İnternet bağlantısı gerektirmez.
- Notlarını herhangi bir sunucuya göndermez.
- Veriler yalnızca kendi bilgisayarında tutulur.

Windows üzerinde veriler genellikle şu klasörde saklanır:

```text
C:\Users\KULLANICI_ADI\AppData\Roaming\Postiva
```

Bu klasör içinde notlar, panolar, ayarlar ve otomatik kurtarma yedekleri bulunur.

Başka biri Postiva'yı kendi bilgisayarına kurduğunda senin notlarını göremez. Her kullanıcının verisi kendi Windows hesabına ait klasörde saklanır.

---

## Kullanılan teknolojiler

- **Electron**
- **React 19**
- **Vite**
- **electron-vite**
- **JavaScript ES6**
- **Node.js**
- **CSS**
- **Electron IPC**
- **JSON tabanlı yerel veri sistemi**
- **electron-builder**
- **Git ve GitHub**

---

## Proje mimarisi

Postiva'da arayüz ile dosya sistemi doğrudan birbirine bağlanmaz. Veri akışı katmanlı bir yapı üzerinden ilerler:

```text
React arayüzü
      ↓
Preload API
      ↓
Electron IPC
      ↓
Service katmanı
      ↓
Store katmanı
      ↓
Yerel JSON dosyaları
```

Bu yapıyı tercih etmemin nedeni kodu tek bir dosyada toplamak yerine daha düzenli, anlaşılır ve geliştirilebilir bir proje oluşturmaktır.

### Temel klasör yapısı

```text
postiva/
├─ build/
│  ├─ icon.ico
│  ├─ icon.png
│  ├─ tray-icon.png
│  └─ window-icon.png
│
├─ src/
│  ├─ main/
│  │  ├─ ipc/
│  │  ├─ services/
│  │  ├─ stores/
│  │  └─ index.js
│  │
│  ├─ preload/
│  │  └─ index.js
│  │
│  └─ renderer/
│     ├─ index.html
│     └─ src/
│        ├─ assets/
│        ├─ components/
│        ├─ App.jsx
│        └─ main.jsx
│
├─ electron-builder.yml
├─ electron.vite.config.mjs
├─ package.json
└─ README.md
```

---

## Projeyi geliştirme ortamında çalıştırma

Projeyi klonla:

```bash
git clone https://github.com/237mrt/postiva.git
cd postiva
```

Bağımlılıkları yükle:

```bash
npm install
```

Geliştirme modunda başlat:

```bash
npm run dev
```

Kod kalitesini kontrol et:

```bash
npm run lint
```

Üretim derlemesi oluştur:

```bash
npm run build
```

Kurulum yapmadan Windows paketini test et:

```bash
npm run build:unpack
```

Windows kurulum dosyasını oluştur:

```bash
npm run build:win
```

Kurulum dosyası `dist` klasörü içinde oluşur:

```text
dist/Postiva-Setup-1.0.0.exe
```

---

## Kullanılabilir komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme modunda çalıştırır |
| `npm run lint` | ESLint kontrolünü çalıştırır |
| `npm run format` | Kodları Prettier ile biçimlendirir |
| `npm run build` | Production derlemesi oluşturur |
| `npm run start` | Derlenmiş uygulamayı önizler |
| `npm run build:unpack` | Kurulum yapmadan Windows paketini oluşturur |
| `npm run build:win` | Windows NSIS kurulum dosyasını oluşturur |

---

## Neden bu projeyi yaptım?

Postiva benim için yalnızca bir not uygulaması değil, aynı zamanda gerçek bir masaüstü uygulamasını baştan sona geliştirme süreciydi.

Bu proje boyunca:

- Electron ana süreç mantığını
- React bileşen ve state yönetimini
- Preload ile güvenli API oluşturmayı
- IPC iletişimini
- Katmanlı uygulama mimarisini
- Yerel dosya yönetimini
- Bildirim ve sistem tepsisi kullanımını
- Yedekleme ve veri doğrulamasını
- Windows uygulaması paketlemeyi
- Git ve GitHub üzerinden sürüm yayınlamayı

uygulamalı olarak öğrenme ve geliştirme fırsatı buldum.

Amacım yalnızca çalışan kod yazmak değil; yazdığım kodun neden çalıştığını anlayarak gerçek bir ürün ortaya çıkarmaktı.

---

## Katkı ve geri bildirim

Postiva'yı kullanırken bir hata fark edersen veya yeni bir özellik önermek istersen GitHub üzerinden issue açabilirsin.

Projeyi incelemek, geliştirmek veya katkıda bulunmak isteyenler fork ve pull request akışını kullanabilir.

---

## Geliştirici

**Developed by [237mrt](https://github.com/237mrt)**

Postiva'yı öğrenerek, deneyerek ve her aşamasını adım adım geliştirerek hazırladım. 🚀
