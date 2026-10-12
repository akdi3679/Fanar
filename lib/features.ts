export type SiteTypeId = 'landing' | 'vitrine' | 'ecommerce';
export type L = { en: string; fr: string; ar: string };

export interface Feature {
  id: string;
  name: L;
  desc: L;
  price: number;
  category: string;
  timeDays: number;
  siteTypes: SiteTypeId[];
  popular?: boolean;
}

export interface SiteType {
  id: SiteTypeId;
  name: L;
  tagline: L;
  basePrice: number;
  why: L;
  included: L[];
}

export const SITE_TYPES: SiteType[] = [
  {
    id: 'landing',
    name: { en: 'Landing Page', fr: 'Page Atterrissage', ar: 'صفحة هبوط' },
    tagline: { en: 'One page to convert visitors', fr: 'Une page pour convertir', ar: 'صفحة واحدة للتحويل' },
    basePrice: 790,
    why: {
      en: 'Includes 1 high-converting page, hero, CTA, contact form, mobile-first design, fast loading.',
      fr: 'Inclut 1 page optimisée, hero, CTA, formulaire, design mobile, chargement rapide.',
      ar: 'يشمل صفحة واحدة محسّنة، نموذج اتصال، تصميم متجاوب، تحميل سريع.'
    },
    included: [
      { en: '1 conversion page', fr: '1 page de conversion', ar: 'صفحة تحويل واحدة' },
      { en: 'Contact form', fr: 'Formulaire de contact', ar: 'نموذج اتصال' },
      { en: 'Mobile responsive', fr: 'Responsive mobile', ar: 'متجاوب مع الهاتف' },
      { en: 'Fast loading', fr: 'Chargement rapide', ar: 'تحميل سريع' }
    ]
  },
  {
    id: 'vitrine',
    name: { en: 'Showcase Site', fr: 'Site Vitrine', ar: 'موقع تعريفي' },
    tagline: { en: 'Present your business professionally', fr: 'Présentez votre activité', ar: 'قدّم نشاطك باحترافية' },
    basePrice: 1490,
    why: {
      en: 'Includes up to 5 pages, gallery, contact, map, mobile design, basic SEO.',
      fr: 'Inclut jusqu\u2019à 5 pages, galerie, contact, carte, design mobile, SEO de base.',
      ar: 'يشمل حتى 5 صفحات، معرض، اتصال، خريطة، تصميم متجاوب، SEO أساسي.'
    },
    included: [
      { en: 'Up to 5 pages', fr: 'Jusqu\u2019à 5 pages', ar: 'حتى 5 صفحات' },
      { en: 'Gallery / portfolio', fr: 'Galerie / portfolio', ar: 'معرض أعمال' },
      { en: 'Contact + map', fr: 'Contact + carte', ar: 'اتصال + خريطة' },
      { en: 'Basic SEO', fr: 'SEO de base', ar: 'SEO أساسي' }
    ]
  },
  {
    id: 'ecommerce',
    name: { en: 'E-commerce', fr: 'E-commerce', ar: 'متجر إلكتروني' },
    tagline: { en: 'Sell your products online', fr: 'Vendez vos produits en ligne', ar: 'بِع منتجاتك عبر الإنترنت' },
    basePrice: 2500,
    why: {
      en: 'Includes catalog (20 products), cart, secure checkout, payment, order management.',
      fr: 'Inclut catalogue (20 produits), panier, paiement sécurisé, gestion des commandes.',
      ar: 'يشمل كتالوج (20 منتج)، سلة، دفع آمن، إدارة الطلبات.'
    },
    included: [
      { en: '20 products catalog', fr: 'Catalogue 20 produits', ar: 'كتالوج 20 منتج' },
      { en: 'Cart + checkout', fr: 'Panier + paiement', ar: 'سلة + دفع' },
      { en: 'Secure payment', fr: 'Paiement sécurisé', ar: 'دفع آمن' },
      { en: 'Order management', fr: 'Gestion commandes', ar: 'إدارة الطلبات' }
    ]
  }
];

export const CATEGORIES: { id: string; label: L }[] = [
  { id: 'all', label: { en: 'All', fr: 'Tout', ar: 'الكل' } },
  { id: 'pages', label: { en: 'Pages & Content', fr: 'Pages & Contenu', ar: 'صفحات ومحتوى' } },
  { id: 'booking', label: { en: 'Booking & Reservation', fr: 'Réservation', ar: 'الحجز' } },
  { id: 'store', label: { en: 'E-commerce & Sales', fr: 'E-commerce & Ventes', ar: 'متجر ومبيعات' } },
  { id: 'marketing', label: { en: 'Marketing & SEO', fr: 'Marketing & SEO', ar: 'تسويق و SEO' } },
  { id: 'design', label: { en: 'Design & Contact', fr: 'Design & Contact', ar: 'تصميم واتصال' } },
  { id: 'advanced', label: { en: 'Advanced & Custom', fr: 'Avancé & Sur mesure', ar: 'متقدم ومخصص' } },
  { id: 'support', label: { en: 'Maintenance', fr: 'Maintenance', ar: 'صيانة' } }
];

export const FEATURES: Feature[] = [
  // ---- PAGES & CONTENT ----
  { id: 'extra_page', category: 'pages', price: 90, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'], popular: true,
    name: { en: 'Additional Page', fr: 'Page supplémentaire', ar: 'صفحة إضافية' },
    desc: { en: 'Add one more page to your site', fr: 'Ajouter une page de plus', ar: 'أضف صفحة إضافية' } },
  { id: 'blog_setup', category: 'pages', price: 180, timeDays: 3, siteTypes: ['vitrine','ecommerce'],
    name: { en: 'Blog Setup', fr: 'Création Blog', ar: 'إنشاء مدونة' },
    desc: { en: 'Blog system to publish articles', fr: 'Système de blog pour publier', ar: 'نظام مدونة للنشر' } },
  { id: 'blog_article', category: 'pages', price: 40, timeDays: 1, siteTypes: ['vitrine','ecommerce'],
    name: { en: 'Blog Article (each)', fr: 'Article de blog (l\u2019unité)', ar: 'مقال مدونة' },
    desc: { en: 'One written article for your blog', fr: 'Un article rédigé pour votre blog', ar: 'مقال مكتوب لمدونتك' } },
  { id: 'team_section', category: 'pages', price: 80, timeDays: 1, siteTypes: ['vitrine'],
    name: { en: 'Team Section', fr: 'Section Équipe', ar: 'قسم الفريق' },
    desc: { en: 'Present your team members', fr: 'Présentez votre équipe', ar: 'اعرض فريقك' } },
  { id: 'services_listing', category: 'pages', price: 90, timeDays: 2, siteTypes: ['vitrine'],
    name: { en: 'Services Listing', fr: 'Liste des Services', ar: 'قائمة الخدمات' },
    desc: { en: 'Detailed services page', fr: 'Page détaillée des services', ar: 'صفحة خدمات مفصلة' } },
  { id: 'faq_section', category: 'pages', price: 60, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'FAQ Section', fr: 'Section FAQ', ar: 'قسم الأسئلة الشائعة' },
    desc: { en: 'Frequently asked questions', fr: 'Questions fréquentes', ar: 'الأسئلة المتكررة' } },
  { id: 'testimonials', category: 'pages', price: 70, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Testimonials', fr: 'Témoignages', ar: 'آراء العملاء' },
    desc: { en: 'Client reviews & testimonials', fr: 'Avis et témoignages clients', ar: 'تقييمات العملاء' } },
  { id: 'multilang', category: 'pages', price: 120, timeDays: 2, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Extra Language', fr: 'Langue supplémentaire', ar: 'لغة إضافية' },
    desc: { en: 'Add one more language', fr: 'Ajouter une langue de plus', ar: 'أضف لغة إضافية' } },

  // ---- BOOKING & RESERVATION ----
  { id: 'booking_whatsapp', category: 'booking', price: 90, timeDays: 1, siteTypes: ['landing','vitrine'], popular: true,
    name: { en: 'WhatsApp Booking', fr: 'Réservation WhatsApp', ar: 'حجز واتساب' },
    desc: { en: 'Clients book via WhatsApp', fr: 'Réservation via WhatsApp', ar: 'الحجز عبر واتساب' } },
  { id: 'booking_telegram', category: 'booking', price: 90, timeDays: 1, siteTypes: ['landing','vitrine'],
    name: { en: 'Telegram Booking', fr: 'Réservation Telegram', ar: 'حجز تيليجرام' },
    desc: { en: 'Clients book via Telegram', fr: 'Réservation via Telegram', ar: 'الحجز عبر تيليجرام' } },
  { id: 'booking_dashboard', category: 'booking', price: 250, timeDays: 5, siteTypes: ['vitrine'], popular: true,
    name: { en: 'Booking Dashboard (CMS)', fr: 'Tableau de bord Réservation', ar: 'لوحة تحكم الحجز' },
    desc: { en: 'Manage bookings from a dashboard', fr: 'Gérez les réservations depuis un tableau de bord', ar: 'إدارة الحجوزات من لوحة تحكم' } },
  { id: 'booking_email_notif', category: 'booking', price: 70, timeDays: 1, siteTypes: ['vitrine'],
    name: { en: 'Email Booking Alerts', fr: 'Alertes Email Réservation', ar: 'تنبيهات حجز بالبريد' },
    desc: { en: 'Get an email for each booking', fr: 'Email à chaque réservation', ar: 'بريد لكل حجز' } },
  { id: 'calendar_google', category: 'booking', price: 80, timeDays: 1, siteTypes: ['vitrine'],
    name: { en: 'Google Calendar Sync', fr: 'Sync Google Agenda', ar: 'مزامنة تقويم جوجل' },
    desc: { en: 'Sync bookings with Google Calendar', fr: 'Synchroniser avec Google Agenda', ar: 'مزامنة مع تقويم جوجل' } },
  { id: 'appointment_reminder', category: 'booking', price: 120, timeDays: 2, siteTypes: ['vitrine'],
    name: { en: 'Auto Reminders', fr: 'Rappels Automatiques', ar: 'تذكيرات تلقائية' },
    desc: { en: 'SMS/Email appointment reminders', fr: 'Rappels de rendez-vous', ar: 'تذكيرات المواعيد' } },
  { id: 'booking_service', category: 'booking', price: 220, timeDays: 4, siteTypes: ['vitrine'],
    name: { en: 'Service Booking (salon, gym...)', fr: 'Réservation Service (salon, gym...)', ar: 'حجز خدمات (صالون، جيم...)' },
    desc: { en: 'Booking system for service businesses', fr: 'Réservation pour salons, gyms, etc.', ar: 'نظام حجز للخدمات' } },

  // ---- E-COMMERCE & SALES ----
  { id: 'extra_products', category: 'store', price: 50, timeDays: 1, siteTypes: ['ecommerce'],
    name: { en: 'Extra 20 Products', fr: '20 Produits Suppl.', ar: '20 منتج إضافي' },
    desc: { en: 'Add 20 more products', fr: 'Ajouter 20 produits de plus', ar: 'أضف 20 منتج' } },
  { id: 'payment_stripe', category: 'store', price: 150, timeDays: 2, siteTypes: ['ecommerce'], popular: true,
    name: { en: 'Stripe / PayPal Payment', fr: 'Paiement Stripe / PayPal', ar: 'دفع Stripe / PayPal' },
    desc: { en: 'International card payments', fr: 'Paiement par carte international', ar: 'دفع دولي بالبطاقة' } },
  { id: 'payment_local', category: 'store', price: 180, timeDays: 3, siteTypes: ['ecommerce'],
    name: { en: 'Local Payment Gateway', fr: 'Paiement Local', ar: 'بوابة دفع محلية' },
    desc: { en: 'ClickToPay / local gateway', fr: 'ClickToPay / passerelle locale', ar: 'بوابة دفع محلية' } },
  { id: 'order_dashboard', category: 'store', price: 220, timeDays: 4, siteTypes: ['ecommerce'],
    name: { en: 'Order Management', fr: 'Gestion des Commandes', ar: 'إدارة الطلبات' },
    desc: { en: 'Dashboard to manage orders', fr: 'Tableau de bord des commandes', ar: 'لوحة إدارة الطلبات' } },
  { id: 'customer_accounts', category: 'store', price: 150, timeDays: 3, siteTypes: ['ecommerce'],
    name: { en: 'Customer Accounts', fr: 'Comptes Clients', ar: 'حسابات العملاء' },
    desc: { en: 'Client login & order history', fr: 'Connexion client & historique', ar: 'تسجيل دخول العملاء' } },
  { id: 'product_reviews', category: 'store', price: 80, timeDays: 1, siteTypes: ['ecommerce'],
    name: { en: 'Product Reviews', fr: 'Avis Produits', ar: 'تقييمات المنتجات' },
    desc: { en: 'Client reviews on products', fr: 'Avis clients sur les produits', ar: 'تقييمات على المنتجات' } },
  { id: 'discount_codes', category: 'store', price: 70, timeDays: 1, siteTypes: ['ecommerce'],
    name: { en: 'Discount Codes', fr: 'Codes Promo', ar: 'أكواد خصم' },
    desc: { en: 'Create promo codes', fr: 'Créer des codes promo', ar: 'إنشاء أكواد خصم' } },
  { id: 'shipping_calc', category: 'store', price: 90, timeDays: 2, siteTypes: ['ecommerce'],
    name: { en: 'Shipping Calculator', fr: 'Calculateur Livraison', ar: 'حاسبة الشحن' },
    desc: { en: 'Auto shipping cost by zone', fr: 'Frais de livraison par zone', ar: 'تكلفة شحن حسب المنطقة' } },
  { id: 'abandoned_cart', category: 'store', price: 130, timeDays: 2, siteTypes: ['ecommerce'],
    name: { en: 'Abandoned Cart Recovery', fr: 'Récupération Panier', ar: 'استرجاع السلة' },
    desc: { en: 'Recover abandoned carts by email', fr: 'Relancer les paniers abandonnés', ar: 'استرجاع السلات المتروكة' } },

  // ---- MARKETING & SEO ----
  { id: 'seo_basic', category: 'marketing', price: 120, timeDays: 2, siteTypes: ['landing','vitrine','ecommerce'], popular: true,
    name: { en: 'Basic SEO', fr: 'SEO de Base', ar: 'SEO أساسي' },
    desc: { en: 'On-page SEO + Google indexing', fr: 'SEO on-page + indexation Google', ar: 'SEO أساسي + فهرسة جوجل' } },
  { id: 'seo_advanced', category: 'marketing', price: 250, timeDays: 5, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Advanced SEO', fr: 'SEO Avancé', ar: 'SEO متقدم' },
    desc: { en: 'Full SEO strategy + optimization', fr: 'Stratégie SEO complète', ar: 'استراتيجية SEO كاملة' } },
  { id: 'google_analytics', category: 'marketing', price: 60, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Google Analytics', fr: 'Google Analytics', ar: 'إحصائيات جوجل' },
    desc: { en: 'Track your visitors', fr: 'Suivez vos visiteurs', ar: 'تتبع زوارك' } },
  { id: 'facebook_pixel', category: 'marketing', price: 70, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Facebook Pixel', fr: 'Pixel Facebook', ar: 'بكسل فيسبوك' },
    desc: { en: 'Track ads conversions', fr: 'Suivi des conversions publicitaires', ar: 'تتبع تحويلات الإعلانات' } },
  { id: 'google_ads_setup', category: 'marketing', price: 150, timeDays: 2, siteTypes: ['landing','ecommerce'],
    name: { en: 'Google Ads Setup', fr: 'Configuration Google Ads', ar: 'إعداد إعلانات جوجل' },
    desc: { en: 'Launch your first campaigns', fr: 'Lancez vos premières campagnes', ar: 'أطلق حملاتك الأولى' } },
  { id: 'email_marketing', category: 'marketing', price: 140, timeDays: 2, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Email Marketing Setup', fr: 'Email Marketing', ar: 'تسويق بالبريد' },
    desc: { en: 'Newsletter + automated emails', fr: 'Newsletter + emails automatisés', ar: 'نشرة بريدية + رسائل آلية' } },

  // ---- DESIGN & CONTACT ----
  { id: 'logo_design', category: 'design', price: 150, timeDays: 3, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Logo Design', fr: 'Création Logo', ar: 'تصميم شعار' },
    desc: { en: 'Professional logo + variants', fr: 'Logo professionnel + variantes', ar: 'شعار احترافي' } },
  { id: 'whatsapp_button', category: 'design', price: 40, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'], popular: true,
    name: { en: 'WhatsApp Button', fr: 'Bouton WhatsApp', ar: 'زر واتساب' },
    desc: { en: 'Floating WhatsApp chat button', fr: 'Bouton WhatsApp flottant', ar: 'زر واتساب عائم' } },
  { id: 'google_maps', category: 'design', price: 50, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Google Maps Location', fr: 'Localisation Google Maps', ar: 'موقع خرائط جوجل' },
    desc: { en: 'Interactive map of your location', fr: 'Carte interactive de votre local', ar: 'خريطة تفاعلية لموقعك' } },
  { id: 'business_hours', category: 'design', price: 30, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Business Hours Display', fr: 'Affichage Horaires', ar: 'عرض ساعات العمل' },
    desc: { en: 'Show your opening hours', fr: 'Affichez vos horaires', ar: 'اعرض ساعات العمل' } },
  { id: 'newsletter', category: 'design', price: 60, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Newsletter Signup', fr: 'Inscription Newsletter', ar: 'اشتراك نشرة بريدية' },
    desc: { en: 'Collect visitor emails', fr: 'Collectez les emails des visiteurs', ar: 'اجمع بريد الزوار' } },
  { id: 'social_links', category: 'design', price: 40, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Social Media Links', fr: 'Liens Réseaux Sociaux', ar: 'روابط التواصل' },
    desc: { en: 'Connect your social accounts', fr: 'Reliez vos réseaux sociaux', ar: 'اربط حساباتك الاجتماعية' } },

  // ---- ADVANCED & CUSTOM ----
  { id: 'ai_chatbot', category: 'advanced', price: 350, timeDays: 5, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'AI Chatbot', fr: 'Chatbot IA', ar: 'روبوت محادثة ذكي' },
    desc: { en: 'AI assistant answering clients 24/7', fr: 'Assistant IA 24/7', ar: 'مساعد ذكي 24/7' } },
  { id: 'custom_dashboard', category: 'advanced', price: 400, timeDays: 7, siteTypes: ['vitrine','ecommerce'],
    name: { en: 'Custom Admin Dashboard', fr: 'Tableau de Bord Sur Mesure', ar: 'لوحة تحكم مخصصة' },
    desc: { en: 'Tailor-made management panel', fr: 'Panneau de gestion sur mesure', ar: 'لوحة إدارة مخصصة' } },
  { id: 'membership', category: 'advanced', price: 380, timeDays: 6, siteTypes: ['vitrine','ecommerce'],
    name: { en: 'Membership / Subscription', fr: 'Espace Membre / Abonnement', ar: 'عضوية / اشتراك' },
    desc: { en: 'Paid member area', fr: 'Espace membre payant', ar: 'منطقة أعضاء مدفوعة' } },
  { id: 'lms_courses', category: 'advanced', price: 500, timeDays: 8, siteTypes: ['vitrine'],
    name: { en: 'Online Courses (LMS)', fr: 'Formations en Ligne (LMS)', ar: 'دورات أونلاين' },
    desc: { en: 'Sell & host online courses', fr: 'Vendez et hébergez des formations', ar: 'بِع واستضف دورات' } },
  { id: 'real_estate', category: 'advanced', price: 320, timeDays: 6, siteTypes: ['vitrine'],
    name: { en: 'Real Estate Listings', fr: 'Annonces Immobilières', ar: 'عقارات' },
    desc: { en: 'Property listings with filters', fr: 'Annonce immobilière avec filtres', ar: 'عقارات مع فلاتر' } },
  { id: 'restaurant_menu', category: 'advanced', price: 280, timeDays: 5, siteTypes: ['vitrine'],
    name: { en: 'Restaurant Menu + Ordering', fr: 'Menu Restaurant + Commande', ar: 'قائمة مطعم + طلب' },
    desc: { en: 'Digital menu with online ordering', fr: 'Menu digital avec commande en ligne', ar: 'قائمة رقمية مع طلب' } },
  { id: 'event_management', category: 'advanced', price: 300, timeDays: 6, siteTypes: ['vitrine'],
    name: { en: 'Event Management', fr: 'Gestion Événements', ar: 'إدارة فعاليات' },
    desc: { en: 'Event listing & registration', fr: 'Événements & inscription', ar: 'فعاليات وتسجيل' } },
  { id: 'job_board', category: 'advanced', price: 250, timeDays: 4, siteTypes: ['vitrine'],
    name: { en: 'Job Board / Careers', fr: 'Offres d\u2019Emploi', ar: 'وظائف' },
    desc: { en: 'Post jobs & receive applications', fr: 'Publiez des offres d\u2019emploi', ar: 'انشر وظائف واستقبل طلبات' } },
  { id: 'donation_system', category: 'advanced', price: 150, timeDays: 3, siteTypes: ['vitrine'],
    name: { en: 'Donation System', fr: 'Système de Dons', ar: 'نظام تبرعات' },
    desc: { en: 'Accept donations online', fr: 'Acceptez des dons en ligne', ar: 'استقبل تبرعات أونلاين' } },
  { id: 'quote_calculator', category: 'advanced', price: 180, timeDays: 3, siteTypes: ['landing','vitrine'],
    name: { en: 'Quote / Price Calculator', fr: 'Calculateur de Devis', ar: 'حاسبة أسعار' },
    desc: { en: 'Interactive price estimator', fr: 'Estimateur de prix interactif', ar: 'حاسبة أسعار تفاعلية' } },
  { id: 'pwa_app', category: 'advanced', price: 200, timeDays: 4, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'PWA (Installable App)', fr: 'PWA (App Installable)', ar: 'تطبيق قابل للتثبيت' },
    desc: { en: 'Turn site into installable app', fr: 'Transformez le site en app', ar: 'حوّل الموقع لتطبيق' } },
  { id: 'api_integration', category: 'advanced', price: 300, timeDays: 5, siteTypes: ['vitrine','ecommerce'],
    name: { en: 'Custom API Integration', fr: 'Intégration API Sur Mesure', ar: 'تكامل API مخصص' },
    desc: { en: 'Connect external services', fr: 'Connectez des services externes', ar: 'اربط خدمات خارجية' } },

  // ---- MAINTENANCE ----
  { id: 'maintenance_monthly', category: 'support', price: 49, timeDays: 0, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Monthly Maintenance', fr: 'Maintenance Mensuelle', ar: 'صيانة شهرية' },
    desc: { en: 'Updates, backups, security', fr: 'Mises à jour, sauvegardes, sécurité', ar: 'تحديثات ونسخ احتياطي' } },
  { id: 'hosting_domain', category: 'support', price: 80, timeDays: 1, siteTypes: ['landing','vitrine','ecommerce'],
    name: { en: 'Hosting + Domain (1 year)', fr: 'Hébergement + Domaine (1 an)', ar: 'استضافة + نطاق (سنة)' },
    desc: { en: 'Hosting & domain name for 1 year', fr: 'Hébergement & nom de domaine 1 an', ar: 'استضافة ونطاق لسنة' } }
];