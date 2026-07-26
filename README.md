# Postiva 📝

Postiva, günlük notlarımı ve yapmam gereken işleri daha düzenli takip edebilmek için geliştirmeye başladığım masaüstü bir not uygulaması.

Bu projeyi hazır bir paket kullanarak ortaya çıkarmak yerine, her bölümünü adım adım geliştirerek hem gerçekten kullanabileceğim bir uygulama yapmak hem de Electron, React ve Node.js tarafında kendimi geliştirmek için hazırlıyorum.

Uygulamanın tasarımında klasik ve ciddi not uygulamalarından biraz uzaklaşıp; koyu tema, yumuşak renkler ve pixel-art detayları olan daha samimi bir görünüm oluşturmaya çalıştım.

> Postiva hâlâ geliştirme aşamasında. Yeni özellikler geldikçe proje düzenli olarak güncellenecek.

---

## Postiva ne yapıyor?

Postiva ile:

- Yeni not oluşturabiliyorum.
- Notları düzenleyebiliyor ve silebiliyorum.
- Silinen notları çöp kutusundan geri yükleyebiliyorum.
- Notlara renk, öncelik ve son tarih ekleyebiliyorum.
- Notları tamamlandı olarak işaretleyebiliyorum.
- Bugün, yaklaşanlar ve tamamlananlar bölümlerinden görevleri takip edebiliyorum.
- Notlar arasında arama yapabiliyorum.
- Kendime özel panolar oluşturabiliyorum.
- Panoların adını, simgesini ve rengini değiştirebiliyorum.
- Notları istediğim panoya bağlayabiliyorum.
- Bir panoya tıkladığımda yalnızca o panoya ait notları görebiliyorum.
- Verilerimi internet bağlantısına ihtiyaç duymadan bilgisayarımda saklayabiliyorum.

---

## Neden bu projeyi yaptım?

Bir yandan günlük kullanabileceğim sade ve eğlenceli bir not uygulaması geliştirmek, bir yandan da gerçek bir masaüstü uygulamasının nasıl kurulduğunu öğrenmek istedim.

Bu proje boyunca özellikle şu konular üzerinde çalışıyorum:

- Electron ile masaüstü uygulama geliştirme
- React ile bileşen ve state yönetimi
- Preload ve IPC iletişimi
- Katmanlı uygulama mimarisi
- JSON dosyalarıyla yerel veri saklama
- Form doğrulama ve hata yönetimi
- Kullanıcı deneyimi ve arayüz tasarımı
- Git ve GitHub ile sürüm takibi

Kısacası Postiva sadece ortaya çıkarmaya çalıştığım bir uygulama değil, aynı zamanda benim için aktif bir öğrenme projesi.

---

## Kullanılan teknolojiler

- Electron
- React
- Vite
- JavaScript ES6
- Node.js
- CSS
- JSON tabanlı yerel veri sistemi
- Git ve GitHub

---

## Proje yapısı

```text
postiva/
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
│     └─ src/
│        ├─ components/
│        ├─ assets/
│        ├─ App.jsx
│        └─ main.jsx
│
├─ package.json
└─ README.md
```

Uygulamadaki temel veri akışı şu şekilde ilerliyor:

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
JSON dosyaları
```

Bu yapıyı tercih etmemin amacı kodu tek bir dosyada toplamak yerine daha düzenli, anlaşılır ve geliştirilebilir bir proje oluşturmak.

---

## Kurulum

Projeyi bilgisayarına klonla:

```bash
git clone https://github.com/237mrt/postiva.git
```

Proje klasörüne gir:

```bash
cd postiva
```

Bağımlılıkları yükle:

```bash
npm install
```

Uygulamayı geliştirme modunda çalıştır:

```bash
npm run dev
```

---

## Veriler nerede saklanıyor?

Postiva şu an verileri yerel JSON dosyalarında saklıyor.

Bu sayede:

- İnternet bağlantısı gerekmiyor.
- Bir kullanıcı hesabı açmak gerekmiyor.
- Notlar doğrudan kullanıcının bilgisayarında tutuluyor.

Notlar ve panolar Electron'un `userData` klasörü altında saklanıyor.

---

## Şu anda tamamlanan özellikler

- [x] Electron + React + Vite altyapısı
- [x] Koyu pixel-art arayüz
- [x] Yerel JSON veri sistemi
- [x] Not oluşturma
- [x] Not düzenleme
- [x] Notu çöp kutusuna taşıma
- [x] Notu geri yükleme
- [x] Notu kalıcı silme
- [x] Not arama
- [x] Not renkleri
- [x] Öncelik sistemi
- [x] Son tarih ve saat
- [x] Tamamlandı durumu
- [x] Bugün görünümü
- [x] Yaklaşanlar görünümü
- [x] Tamamlananlar görünümü
- [x] Pano oluşturma
- [x] Pano düzenleme
- [x] Pano silme
- [x] Notları panolara bağlama
- [x] Panoya göre not filtreleme

---

## Planladığım özellikler

- [ ] Not sabitleme
- [ ] Notları farklı ölçütlere göre sıralama
- [ ] Geciken görev göstergesi
- [ ] Masaüstü bildirimleri
- [ ] Panoları sürükleyerek sıralama
- [ ] Veri yedekleme ve geri yükleme
- [ ] Ayarlar ekranı
- [ ] Uygulama başlangıç ayarları
- [ ] Windows kurulum dosyası
- [ ] Uygulama ikonu
- [ ] Genel testler ve hata düzeltmeleri

---

## Projenin durumu

Postiva'nın temel sistemi çalışıyor ve günlük kullanım için gerekli ana özelliklerin büyük bölümü hazır.

Şu anki tahmini durum:

- İşlevsel MVP: **%70–75**
- Dağıtıma hazır masaüstü sürümü: **%55–60**

Önümüzdeki aşamalarda daha çok bildirimler, sıralama, yedekleme, ayarlar ve paketleme tarafına odaklanacağım.

---

## Geliştirme yaklaşımım

Projeyi olabildiğince adım adım geliştiriyorum.

Her yeni özellikte önce:

1. Veri tarafını hazırlıyorum.
2. Electron IPC bağlantısını kuruyorum.
3. React arayüzüne bağlıyorum.
4. Uygulama üzerinden test ediyorum.
5. Sorunları düzelttikten sonra GitHub'a gönderiyorum.

Amacım yalnızca çalışan kod yazmak değil; yazdığım kodun neden çalıştığını da öğrenmek.

---

## Katkı ve geri bildirim

Postiva şu an kişisel olarak geliştirdiğim bir proje. Yine de projeyi inceleyenlerin fikirlerine ve geri bildirimlerine açığım.

Bir hata fark edersen veya güzel olacağını düşündüğün bir özellik varsa GitHub üzerinden issue açabilirsin.

---

## Geliştirici

**237mrt**

Bu projeyi öğrenerek, deneyerek ve her aşamasını geliştirerek hazırlıyorum. 🚀
