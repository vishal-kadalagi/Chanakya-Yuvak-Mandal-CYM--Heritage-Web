export interface SiteConfig {
  nameEn: string;
  nameKn: string;
  shortName: string;
  establishedYear: number;
  yearsCount: number;
  address: {
    locality: string;
    localityKn: string;
    place: string;
    placeKn: string;
    taluk: string;
    talukKn: string;
    district: string;
    districtKn: string;
    pincode: string;
    state: string;
    stateKn: string;
    country: string;
    countryKn: string;
  };
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  taglineEn: string;
  taglineKn: string;
  invocationEn: string;
  invocationKn: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  assets: {
    logo: string;
    logoDark: string;
    officialLogo: string;
    favicon: string;
  };
}

export const siteConfig: SiteConfig = {
  nameEn: "Chanakya Yuvak Mandal",
  nameKn: "ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ",
  shortName: "CYM",
  establishedYear: 2019,
  yearsCount: 8, // 2019 - 2026
  address: {
    locality: "Kadalagi Khoot",
    localityKn: "ಕಡಲಗಿ ಖೂಟ",
    place: "Yamakanmardi",
    placeKn: "ಯಮಕನಮರಡಿ",
    taluk: "Hukkeri",
    talukKn: "ಹುಕ್ಕೇರಿ",
    district: "Belagavi",
    districtKn: "ಬೆಳಗಾವಿ",
    pincode: "591246",
    state: "Karnataka",
    stateKn: "ಕರ್ನಾಟಕ",
    country: "India",
    countryKn: "ಭಾರತ",
  },
  email: "chanakyayuvakmandal2019@gmail.com",
  instagramUrl: "https://www.instagram.com/chanakya_yuvakmandal/",
  youtubeUrl: "https://www.youtube.com/@ChanakyaYuvakMandal",
  taglineEn: "Our Tradition · Our Unity · Our History",
  taglineKn: "ನಮ್ಮ ಸಂಪ್ರದಾಯ · ನಮ್ಮ ಏಕತೆ · ನಮ್ಮ ಇತಿಹಾಸ",
  invocationEn: "Chanakya Yuvak Mandal · Est. 2019",
  invocationKn: "ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ · ಸ್ಥಾಪನೆ: 2019",
  googleMapsUrl: "https://www.google.com/maps/place/Chanakya+Yuvak+Mandal,+Kadalagi+Khoot,+Yamakanmardi/@16.1297898,74.5289329,21z/data=!4m15!1m8!3m7!1s0x3bc099ea2f128889:0x29cb622c141c12f8!2sYamakanmardi,+Karnataka!3b1!8m2!3d16.1280496!4d74.5274975!16s%2Fm%2F052_llz!3m5!1s0x3bc099003faf9afb:0x7584201b7d0f28cb!8m2!3d16.129842!4d74.5290432!16s%2Fg%2F11yzd1xwkm?entry=ttu",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1916.2142940245935!2d74.5289329!3d16.129842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc099003faf9afb%3A0x7584201b7d0f28cb!2sChanakya%20Yuvak%20Mandal%2C%20Kadalagi%20Khoot%2C%20Yamakanmardi!5e0!3m2!1sen!2sin!4v1731667000000!5m2!1sen!2sin",
  assets: {
    logo: "/assets/logo_transparent.png",
    logoDark: "/assets/logo_transparent.png",
    officialLogo: "/assets/logo_transparent.png",
    favicon: "/favicon.png",
  },
};
