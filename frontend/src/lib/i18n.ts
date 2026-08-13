export const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      github: 'GitHub',
      login: 'Login',
      dashboard: 'Dashboard',
      getStarted: 'Get Started',
    },
    hero: {
      badge: '✨ AI-Powered Eco-Enzyme Fermentation Platform',
      title: 'Manage Eco-Enzyme Fermentation',
      titleHighlight: 'Smarter',
      titleEnd: 'with AI',
      description:
        'Innovative platform to monitor fermentation health, get product recommendations, and calculate business analysis automatically.',
      ctaPrimary: 'Get Started Now',
      ctaSecondary: 'Explore Features',
    },
    features: {
      subtitle: 'Integrated Platform',
      title: "EcoFlow's Main Features",
      description:
        'Everything you need to produce high-quality eco-enzyme with maximum success rate.',
      aiMonitoring: {
        title: 'AI Fermentation Assistant',
        description:
          'Real-time monitoring with AI for fermentation status prediction (Normal, Caution, Failed).',
      },
      recommendations: {
        title: 'Smart Product Recommendations',
        description:
          'Automatic product recommendations based on your eco-enzyme fermentation characteristics.',
      },
      businessAnalysis: {
        title: 'Business Analysis',
        description:
          'Complete business feasibility analysis: COGS, profit margin, break-even, and revenue projections.',
      },
      batchManagement: {
        title: 'Batch Management',
        description:
          'Manage entire fermentation lifecycle from batch creation to harvest with detailed tracking.',
      },
      autoCalculation: {
        title: 'Automatic Calculations',
        description:
          'Automatic calculation of water & sugar needs, 90-day harvest estimate, and health score.',
      },
      insights: {
        title: 'Smart Insights',
        description:
          'Comprehensive dashboard with milestone tracking and preventive action recommendations.',
      },
    },
    howItWorks: {
      subtitle: 'How It Works',
      title: 'From Organic Waste to Valuable Products',
      description: '4 simple steps, accompanied by AI at every stage.',
      steps: [
        {
          title: 'Create Batch',
          description:
            'Input organic waste weight. System automatically calculates water (3x) & sugar (1x) needs.',
        },
        {
          title: 'Monitor Fermentation',
          description:
            'Record daily observations. AI predicts status & batch health from aroma, color, and gas.',
        },
        {
          title: 'Product Recommendations',
          description:
            'After 90-day harvest, AI recommends best derivative products based on result characteristics.',
        },
        {
          title: 'Feasibility Analysis',
          description: 'System calculates COGS, margin, break-even point, and business profit projections.',
        },
      ],
    },
    cta: {
      title: 'Start Your Organic Waste Transformation Today',
      description: 'Use AI to ensure your eco-enzyme harvest success. Free to start.',
      button: 'Sign Up Free Now',
    },
    footer: {
      copyright: 'All Rights Reserved.',
      version: 'Smart Eco-Enzyme Assistant',
    },
  },
  id: {
    nav: {
      features: 'Fitur',
      howItWorks: 'Cara Kerja',
      github: 'GitHub',
      login: 'Masuk',
      dashboard: 'Dasbor',
      getStarted: 'Mulai Sekarang',
    },
    hero: {
      badge: '✨ Platform Fermentasi Eco-Enzyme Berbasis AI',
      title: 'Kelola Fermentasi Eco-Enzyme',
      titleHighlight: 'Lebih Cerdas',
      titleEnd: 'dengan AI',
      description:
        'Platform inovatif untuk memonitor kesehatan fermentasi, mendapatkan rekomendasi produk turunan, dan menghitung analisis bisnis secara otomatis.',
      ctaPrimary: 'Mulai Sekarang',
      ctaSecondary: 'Pelajari Fitur',
    },
    features: {
      subtitle: 'Platform Terpadu',
      title: 'Fitur Utama EcoFlow',
      description:
        'Semua yang Anda butuhkan untuk memproduksi eco-enzyme berkualitas tinggi dengan tingkat keberhasilan maksimal.',
      aiMonitoring: {
        title: 'Asisten Fermentasi AI',
        description:
          'Pemantauan real-time dengan AI untuk prediksi status fermentasi (Normal, Hati-hati, Gagal).',
      },
      recommendations: {
        title: 'Rekomendasi Produk Cerdas',
        description:
          'Rekomendasi produk otomatis berdasarkan karakteristik hasil fermentasi eco-enzyme Anda.',
      },
      businessAnalysis: {
        title: 'Analisis Bisnis',
        description:
          'Analisis kelayakan bisnis lengkap: COGS, margin profit, break-even, dan proyeksi pendapatan.',
      },
      batchManagement: {
        title: 'Manajemen Batch',
        description:
          'Kelola seluruh siklus fermentasi dari pembuatan batch hingga panen dengan pelacakan detail.',
      },
      autoCalculation: {
        title: 'Perhitungan Otomatis',
        description:
          'Kalkulasi otomatis kebutuhan air & gula, estimasi panen 90 hari, dan skor kesehatan.',
      },
      insights: {
        title: 'Wawasan Cerdas',
        description:
          'Dasbor komprehensif dengan pelacakan pencapaian dan rekomendasi tindakan preventif.',
      },
    },
    howItWorks: {
      subtitle: 'Cara Kerja',
      title: 'Dari Sampah Organik Menjadi Produk Bernilai',
      description: '4 langkah sederhana, didampingi AI di setiap tahap.',
      steps: [
        {
          title: 'Buat Batch',
          description:
            'Input berat sampah organik. Sistem otomatis hitung kebutuhan air (3x) & gula (1x).',
        },
        {
          title: 'Monitor Fermentasi',
          description:
            'Catat observasi harian. AI memprediksi status & kesehatan batch dari aroma, warna, dan gas.',
        },
        {
          title: 'Rekomendasi Produk',
          description:
            'Setelah panen 90 hari, AI merekomendasikan produk turunan terbaik berdasarkan karakteristik hasil.',
        },
        {
          title: 'Analisis Kelayakan',
          description: 'Sistem menghitung COGS, margin, break-even point, dan proyeksi profit bisnis.',
        },
      ],
    },
    cta: {
      title: 'Mulai Transformasi Sampah Organik Anda Hari Ini',
      description: 'Gunakan AI untuk memastikan keberhasilan panen eco-enzyme Anda. Gratis untuk memulai.',
      button: 'Daftar Gratis Sekarang',
    },
    footer: {
      copyright: 'Hak Cipta Dilindungi.',
      version: 'Smart Eco-Enzyme Assistant',
    },
  },
};

export type Language = 'en' | 'id';
export type TranslationKey = keyof typeof translations.en;
