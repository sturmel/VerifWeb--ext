/**
 * Liste des patterns de cookies tiers/analytics exclus de l'analyse sécurité
 * Ces cookies ne peuvent pas être HttpOnly/Secure par design
 */

export const EXCLUDED_COOKIE_PATTERNS = [
  // ==================== GOOGLE ====================
  /^_ga/,           // Google Analytics
  /^_gid/,          // Google Analytics
  /^_gat/,          // Google Analytics
  /^_gcl/,          // Google Ads (inclut _gcl_au, _gcl_aw, etc.)
  /^_gac_/,         // Google Ads conversion
  /^__utm/,         // Google Analytics legacy
  /^__gads/,        // Google Ads
  /^__gpi/,         // Google Publisher
  /^CONSENT/,       // Google consent
  /^NID/,           // Google preferences
  /^1P_JAR/,        // Google
  /^AEC/,           // Google
  /^APISID/,        // Google
  /^HSID/,          // Google
  /^SAPISID/,       // Google
  /^SID/,           // Google
  /^SIDCC/,         // Google
  /^SSID/,          // Google
  /^OGPC/,          // Google
  /^OGP/,           // Google
  /^DV$/,           // Google

  // ==================== META / FACEBOOK ====================
  /^_fbp/,          // Facebook Pixel
  /^_fbc/,          // Facebook Click
  /^fbm_/,          // Facebook
  /^fbsr_/,         // Facebook
  /^fr$/,           // Facebook
  /^xs$/,           // Facebook
  /^c_user/,        // Facebook
  /^datr/,          // Facebook
  /^sb$/,           // Facebook
  /^wd$/,           // Facebook

  // ==================== TIKTOK ====================
  /^_ttp/,          // TikTok Pixel
  /^_tt_/,          // TikTok
  /^tt_/,           // TikTok
  /^ttwid/,         // TikTok
  /^tt_csrf_token/, // TikTok
  /^tt_webid/,      // TikTok
  /^msToken/,       // TikTok

  // ==================== TWITTER / X ====================
  /^_twitter/,      // Twitter
  /^twid/,          // Twitter
  /^guest_id/,      // Twitter
  /^ct0/,           // Twitter
  /^personalization_id/, // Twitter

  // ==================== LINKEDIN ====================
  /^li_/,           // LinkedIn
  /^bcookie/,       // LinkedIn
  /^lidc/,          // LinkedIn
  /^UserMatchHistory/, // LinkedIn
  /^AnalyticsSyncHistory/, // LinkedIn
  /^lang$/,         // LinkedIn

  // ==================== PINTEREST ====================
  /^_pinterest/,    // Pinterest
  /^_pin_/,         // Pinterest

  // ==================== SNAPCHAT ====================
  /^_scid/,         // Snapchat
  /^sc_/,           // Snapchat

  // ==================== MICROSOFT / BING ====================
  /^_uets/,         // Bing Ads
  /^_uetvid/,       // Bing Ads
  /^MUID/,          // Microsoft
  /^MUIDB/,         // Microsoft

  // ==================== ANALYTICS & TRACKING ====================
  /^ph_/,           // PostHog
  /^mp_/,           // Mixpanel
  /^amplitude/,     // Amplitude
  /^ajs_/,          // Segment
  /^_hjSession/,    // Hotjar
  /^_hj/,           // Hotjar
  /^_clck/,         // Microsoft Clarity
  /^_clsk/,         // Microsoft Clarity
  /^CLID/,          // Microsoft Clarity
  /^plausible/,     // Plausible
  /^_pk_/,          // Matomo/Piwik
  /^mtm_/,          // Matomo
  /^piwik/,         // Piwik

  // ==================== CHAT & SUPPORT ====================
  /^intercom/,      // Intercom
  /^crisp/,         // Crisp
  /^__tawkuuid/,    // Tawk.to
  /^tawk/,          // Tawk.to
  /^drift/,         // Drift
  /^hubspot/i,      // HubSpot
  /^__hs/,          // HubSpot
  /^__hstc/,        // HubSpot
  /^__hssrc/,       // HubSpot
  /^__hssc/,        // HubSpot
  /^messagesUtk/,   // HubSpot
  /^_lfa/,          // Leadfeeder
  /^_livechat/,     // LiveChat
  /^zendesk/,       // Zendesk
  /^zd_/,           // Zendesk
  /^_zitok/,        // Zoho

  // ==================== COOKIE CONSENT / GDPR ====================
  /^ncc_/,          // Cookie consent
  /^cc_/,           // Cookie consent
  /^cookieconsent/i, // Cookie consent
  /^tarteaucitron/, // Tarteaucitron
  /^euconsent/,     // EU consent
  /^__consent/,     // Consent
  /^_iub_/,         // Iubenda
  /^_evidon/,       // Evidon
  /^OptanonConsent/, // OneTrust
  /^OptanonAlertBoxClosed/, // OneTrust
  /^_osano/,        // Osano
  /^axeptio/,       // Axeptio
  /^didomi/,        // Didomi
  /^usprivacy/,     // US Privacy
  /^gdpr/i,         // GDPR generic
  /^moove_gdpr/,    // Moove GDPR plugin
  /^cmplz/,         // Complianz
  /^cookieyes/i,    // CookieYes
  /^cookiebot/i,    // Cookiebot
  /^borlabs/i,      // Borlabs Cookie
  /^real_cookie/,   // Real Cookie Banner

  // ==================== WORDPRESS ====================
  /^wp-/,           // WordPress generic
  /^wordpress_/,    // WordPress
  /^wp_/,           // WordPress
  /^wpml_/,         // WPML multilingual
  /^pll_/,          // Polylang
  /^qtrans/,        // qTranslate
  /^icl_/,          // WPML
  /^_icl_/,         // WPML
  /^woocommerce/i,  // WooCommerce (non-auth)
  /^wc_/,           // WooCommerce
  /^elementor/,     // Elementor
  /^jet_/,          // JetPack

  // ==================== OTHER CMS ====================
  /^Drupal\./,      // Drupal
  /^_dc_/,          // Drupal Commerce
  /^joomla/i,       // Joomla
  /^prestashop/i,   // PrestaShop
  /^magento/i,      // Magento
  /^shopify/i,      // Shopify
  /^_shopify/,      // Shopify
  /^_y$/,           // Shopify
  /^_s$/,           // Shopify

  // ==================== ADVERTISING ====================
  /^_rdt_/,         // Reddit Ads
  /^rdt_/,          // Reddit
  /^_ym_/,          // Yandex Metrica
  /^yandex/i,       // Yandex
  /^_dc_/,          // DoubleClick
  /^__doubleclick/, // DoubleClick
  /^_dv_/,          // DoubleVerify
  /^_taboola/,      // Taboola
  /^_outbrain/,     // Outbrain
  /^criteo/i,       // Criteo
  /^cto_/,          // Criteo
  /^__adroll/,      // AdRoll
  /^_mkto_/,        // Marketo
  /^pardot/,        // Pardot/Salesforce
  /^visitor_id/,    // Pardot
  /^_lc2_/,         // LiveChat
  /^_an_/,          // Adobe Analytics
  /^s_cc/,          // Adobe Analytics
  /^s_sq/,          // Adobe Analytics
  /^s_vi/,          // Adobe Analytics
  /^AMCV_/,         // Adobe Marketing Cloud

  // ==================== A/B TESTING ====================
  /^_vis_opt/,      // VWO
  /^_vwo/,          // VWO
  /^optimizely/i,   // Optimizely
  /^_conv_/,        // Convert
  /^ab_/,           // AB Tasty
  /^ABTasty/,       // AB Tasty
  /^_gaexp/,        // Google Optimize
  /^_opt_/,         // Google Optimize

  // ==================== CDN & PERFORMANCE ====================
  /^cf_/,           // Cloudflare
  /^__cf/,          // Cloudflare
  /^_cf_/,          // Cloudflare
  /^__ddg/,         // DuckDuckGo
  /^_lr_/,          // LogRocket
  /^_sentry/,       // Sentry
  /^rl_/,           // Rudderstack
  /^__atuvc/,       // AddThis
  /^__atuvs/,       // AddThis

  // ==================== E-COMMERCE ====================
  /^_conv/,         // Conversion tracking generic
  /^_kla_/,         // Klaviyo
  /^klaviyo/i,      // Klaviyo
  /^mailchimp/i,    // Mailchimp
  /^_mailchimp/,    // Mailchimp
  /^sendinblue/i,   // Sendinblue/Brevo
  /^sib_/,          // Sendinblue
];

export function isExcludedCookie(cookieName) {
  return EXCLUDED_COOKIE_PATTERNS.some(pattern => pattern.test(cookieName));
}
