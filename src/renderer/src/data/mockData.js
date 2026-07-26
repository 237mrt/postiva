export const boards = [
  {
    id: 1,
    icon: "📘",
    name: "Dersler",
    count: 8,
  },
  {
    id: 2,
    icon: "💼",
    name: "İş",
    count: 6,
  },
  {
    id: 3,
    icon: "🚀",
    name: "Projeler",
    count: 7,
  },
  {
    id: 4,
    icon: "💗",
    name: "Kişisel",
    count: 5,
  },
];

export const notes = [
  {
    id: 1,
    color: "purple",
    title: "Matematik Ödevi",
    content: ["Türev alıştırmaları", "5-12 arası sorular", "Yarın teslim!"],
    decoration: "📐",
  },
  {
    id: 2,
    color: "yellow",
    title: "Toplantı Notları",
    content: ["Proje güncellemesi", "Yeni görev dağılımı", "Cuma 14:00"],
    decoration: "👥",
  },
  {
    id: 3,
    color: "pink",
    title: "Alışveriş Listesi",
    content: ["Süt", "Yumurta", "Kahve", "Muz"],
    decoration: "🍓",
  },
  {
    id: 4,
    color: "blue",
    title: "İngilizce Kelimeler",
    content: ["Ambitious", "Challenge", "Improve", "Consistent"],
    decoration: "📚",
  },
  {
    id: 5,
    color: "green",
    title: "Proje Fikirleri",
    content: ["Pomodoro Timer", "Alışkanlık Takibi", "Not uygulaması"],
    decoration: "💡",
  },
  {
    id: 6,
    color: "orange",
    title: "Bugün Yapılacaklar",
    content: ["Spora git", "E-postaları kontrol et", "Kitap oku"],
    decoration: "⭐",
  },
];

export const todayTasks = [
  {
    id: 1,
    title: "Matematik ödevi",
    time: "10:00",
    completed: false,
  },
  {
    id: 2,
    title: "Proje toplantısı",
    time: "11:30",
    completed: true,
  },
  {
    id: 3,
    title: "Rapor taslağı",
    time: "14:00",
    completed: false,
  },
  {
    id: 4,
    title: "GitHub commit",
    time: "16:00",
    completed: false,
  },
];

export const upcomingTasks = [
  {
    id: 1,
    icon: "📘",
    title: "Veri Yapıları Sınavı",
    board: "Dersler",
    date: "14 May",
  },
  {
    id: 2,
    icon: "🚀",
    title: "Proje Teslimi",
    board: "Projeler",
    date: "18 May",
  },
  {
    id: 3,
    icon: "💼",
    title: "Takım Toplantısı",
    board: "İş",
    date: "20 May",
  },
];
