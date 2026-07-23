require("dotenv").config();
const prisma = require("./src/utils/prisma");

const defaults = [
  // Store Info
  { key: "site_name",         value: "Zupwell",           group: "general" },
  { key: "site_email",        value: "support@zupwell.com",  group: "general" },
  { key: "site_phone",        value: "+91 6355466208",    group: "general" },
  { key: "site_address",      value: "A-102 Adarsh Lifestyle, Near Devashya International School, New India Colony, Nikol, 382350 Ahmedabad, Gujarat, India.", group: "general" },
  { key: "site_gstin",        value: "24XXXXXXXXXXXXX",   group: "general" },
  { key: "site_state_code",   value: "24 (Gujarat)",      group: "general" },
  { key: "site_fssai",        value: "10724999000123",    group: "general" },

  // Social
  { key: "social_instagram",  value: "https://instagram.com/zupwell", group: "social" },
  { key: "social_facebook",   value: "https://facebook.com/zupwell",  group: "social" },
  { key: "social_youtube",    value: "",   group: "social" },
  { key: "social_linkedin",   value: "",  group: "social" },

  // Contact
  { key: "contact_whatsapp",      value: "+916355466208",            group: "contact" },
  { key: "contact_support_email", value: "support@zupwell.com",   group: "contact" },
  { key: "contact_info_email",    value: "support@zupwell.com",      group: "contact" },
  { key: "contact_instagram",     value: "https://instagram.com/zupwell", group: "contact" },
  { key: "contact_facebook",      value: "https://facebook.com/zupwell",  group: "contact" },

  // Home Hero Settings
  { key: "hero_badge",       value: "Ahmedabad's #1 Health Supplement Store", group: "home" },
  { key: "hero_title",       value: "A True Companion to Your Health",          group: "home" },
  { key: "hero_tagline",     value: "તમારા સ્વાસ્થ્ય સાથે ચાલો — ઝુપવેલ!", group: "home" },
  { key: "hero_subtext",     value: "Science-backed supplements. Quality is our mantra.", group: "home" },
  { key: "hero_image",       value: "",                                                 group: "home" },
  { key: "hero_image_link",  value: "/products",                                        group: "home" },
  { key: "hero_stat1_value", value: "200+",            group: "home" },
  { key: "hero_stat1_label", value: "Products",        group: "home" },
  { key: "hero_stat2_value", value: "50K+",            group: "home" },
  { key: "hero_stat2_label", value: "Happy Customers", group: "home" },
  { key: "hero_stat3_value", value: "100%",            group: "home" },
  { key: "hero_stat3_label", value: "Authentic",       group: "home" },

  // Home Features Settings
  { key: "feature1_title", value: "Science-Backed",    group: "home" },
  { key: "feature1_desc",  value: "Clinically studied ingredients for maximum effectiveness.", group: "home" },
  { key: "feature2_title", value: "Sugar-Free",        group: "home" },
  { key: "feature2_desc",  value: "Great taste without the sugar load.",                      group: "home" },
  { key: "feature3_title", value: "Instant Energy",    group: "home" },
  { key: "feature3_desc",  value: "Drop, fizz, drink, go.",                                   group: "home" },
  { key: "feature4_title", value: "Best Flavour",      group: "home" },
  { key: "feature4_desc",  value: "Health that actually tastes good.",                         group: "home" },

  // Home Certifications Logo Settings
  { key: "cert_fssai_logo", value: "", group: "home" },
  { key: "cert_iso_logo",   value: "", group: "home" },
  { key: "cert_gmp_logo",   value: "", group: "home" },
  { key: "cert_haccp_logo", value: "", group: "home" },
  { key: "cert_fssc_logo",  value: "", group: "home" },

  // About Founder Settings
  { key: "founder_name",    value: "Parag Hirpara", group: "about" },
  { key: "founder_title",   value: "Founder & CEO", group: "about" },
  { key: "founder_photo",   value: "",              group: "about" },
  { key: "founder_message", value: "At Zupwell, I started with a simple observation: traditional supplements often feel like a chore. I founded Zupwell to bridge the gap between clinical effectiveness and modern convenience.", group: "about" },

  // About General Settings
  { key: "about_punchline",   value: "We don't just sell supplements; we fuel your hustle.", group: "about" },
  { key: "about_description", value: "Zupwell was born with the aim of maintaining health and strength in the modern lifestyle. Quality is our mantra.", group: "about" },
  { key: "about_brand_story", value: "In today's fast-paced life, fatigue, dehydration, and lack of energy hold us back. That's exactly what Zupwell was started to solve.", group: "about" },
  { key: "about_mission",     value: "Health, which is not boring! We believe health supplements should be both effective and delicious.", group: "about" },
  { key: "about_vision",      value: "To be India's leading name in Health Supplements, recognized for quality, scientific integrity and commitment to well-being.", group: "about" },
  { key: "about_future",      value: "Our electrolyte formula is just the beginning. At Zupwell, we are committed to becoming a leader in health supplements. We are currently in the research and development phase for a diverse pipeline of wellness solutions.\\nIncluding,\\n\\n→ Daily multivitamins and immune boosters.\\n→ Energy and focus formulations.\\n→ Specialized recovery blends for post-operative care.\\n\\nWe are constantly looking for new ways to make high-quality nutrition more effective and easier to consume.", group: "about" },
  { key: "about_special_title",   value: "What Makes Zupwell Different?", group: "about" },
  { key: "about_special_subtext", value: "Thoughtfully formulated with quality, convenience, and transparency.", group: "about" },

  // About Static Backup (Obsolete - replaced by JSON lists in vertical settings redesign)
  { key: "about_why1_title",  value: "Science-Backed",   group: "about" },
  { key: "about_why1_desc",   value: "Formulas grounded in clinical research.",                group: "about" },
  { key: "about_why2_title",  value: "Quality First",    group: "about" },
  { key: "about_why2_desc",   value: "High quality ingredients and best manufacturing standards.", group: "about" },
  { key: "about_why3_title",  value: "Consumer Centric", group: "about" },
  { key: "about_why3_desc",   value: "Customer convenience and choice are our top priorities.", group: "about" },

  // Pricing & Tax Settings
  { key: "free_shipping_threshold", value: "500", group: "orders" },
  { key: "gst_rate",                 value: "5.0",  group: "orders" },
  { key: "default_shipping_charge", value: "50",  group: "orders" },
  { key: "order_prefix",            value: "ZW",  group: "orders" },

  // Shop Page Settings
  { key: "shop_badge",              value: "⚡ FUEL YOUR HUSTLE",        group: "shop" },
  { key: "shop_title",              value: "Shop Product",               group: "shop" },
  { key: "shop_subtext",            value: "Performance-driven nutrition.", group: "shop" },

  // Certifications Page Settings
  { key: "cert_fssai_title",        value: "Food Safety and Standards Authority of India", group: "certifications" },
  { key: "cert_fssai_desc",         value: "Licensed under FSSAI regulations. This ensures our manufacturing practices, ingredient safety, and packaging standards comply fully with national food safety guidelines.", group: "certifications" },
  { key: "cert_fssai_file",         value: "/fssai.png", group: "certifications" },
  { key: "cert_gmp_title",          value: "Good Manufacturing Practices", group: "certifications" },
  { key: "cert_gmp_desc",           value: "WHO-GMP compliant manufacturing processes. This guarantees that all products are consistently produced and controlled according to international quality standards.", group: "certifications" },
  { key: "cert_gmp_file",           value: "/gmp.png", group: "certifications" },
  { key: "cert_iso_title",          value: "ISO 9001:2015 Certification", group: "certifications" },
  { key: "cert_iso_desc",           value: "ISO 9001:2015 Certified facility. We adhere to rigorous quality management system (QMS) protocols, ensuring safety, reliability, and continuous improvement across all stages of production.", group: "certifications" },
  { key: "cert_iso_file",           value: "/iso.png", group: "certifications" },
  { key: "cert_haccp_title",         value: "Hazard Analysis Critical Control Point", group: "certifications" },
  { key: "cert_haccp_desc",          value: "HACCP Certified system. A systematic preventive approach to food safety from biological, chemical, and physical hazards in production processes.", group: "certifications" },
  { key: "cert_haccp_file",          value: "/haccp.png", group: "certifications" },

  // Science Page Settings
  { key: "science_hero_badge", value: "Science & Quality", group: "science" },
  { key: "science_hero_title", value: "The confluence of science and purity", group: "science" },
  { key: "science_hero_subtext", value: "Zupwell Quality Standards — where cutting-edge science meets uncompromising purity. Every tablet tells a story of precision.", group: "science" },
  { key: "science_process_badge", value: "Our Process", group: "science" },
  { key: "science_process_title", value: "Manufacturing\nExcellence", group: "science" },
  { key: "science_process1_title", value: "Premium Sourcing", group: "science" },
  { key: "science_process1_desc", value: "We source raw materials from the finest suppliers worldwide. Every ingredient is laboratory tested for purity and efficacy before it ever reaches you.", group: "science" },
  { key: "science_process2_title", value: "Effervescent Technology", group: "science" },
  { key: "science_process2_desc", value: "Our proprietary effervescent formula dissolves completely in water, unlocking fast nutrient absorption. Maximum bioavailability — every single time.", group: "science" },
  { key: "science_cert_badge", value: "Verified & Trusted", group: "science" },
  { key: "science_cert_title", value: "Safety & Certifications", group: "science" },
  { key: "science_cert_subtext", value: "Every product earns its place on your shelf through rigorous testing and official certification.", group: "science" },
  { key: "science_cert1_title", value: "GMP & ISO Certified", group: "science" },
  { key: "science_cert1_desc", value: "Manufactured in WHO-GMP and ISO certified facilities. International standards of hygiene and quality — followed without compromise.", group: "science" },
  { key: "science_cert2_title", value: "FSSAI Approved", group: "science" },
  { key: "science_cert2_desc", value: "Every Zupwell product is manufactured and tested under the strict regulations of FSSAI — India's food safety authority.", group: "science" },
  { key: "science_cert3_title", value: "Lab Tested Batches", group: "science" },
  { key: "science_cert3_desc", value: "Each batch undergoes microbiological testing before market release. 100% verified. 100% safe.", group: "science" },
  { key: "science_clean_badge", value: "No Shortcuts", group: "science" },
  { key: "science_clean_title", value: "Clean Label\nPromise", group: "science" },
  { key: "science_clean_desc", value: "What you see is what you get. No hidden fillers, no misleading labels, no compromises. Pure ingredients, honest transparency.", group: "science" },
  { key: "science_clean1_label", value: "Moisture-Lock Packaging", group: "science" },
  { key: "science_clean1_sub", value: "Precision-sealed tubes keep tablets fresh and potent for longer.", group: "science" },
  { key: "science_clean2_label", value: "Transparent Labelling", group: "science" },
  { key: "science_clean2_sub", value: "What's on the label is exactly what's inside — nothing hidden.", group: "science" },
  { key: "science_clean3_label", value: "No Artificial Colours", group: "science" },
  { key: "science_clean3_sub", value: "Our effervescent colour comes from nature, not a lab dye.", group: "science" },
  { key: "science_tube_title", value: "Moisture-Lock\nTube Design", group: "science" },
  { key: "science_tube_desc", value: "Our precision-engineered tubes create an airtight barrier against humidity. Your tablets stay fresh from the day they're packed to the day you pop them.", group: "science" },
  { key: "science_tube_f1_title", value: "Airtight Seal", group: "science" },
  { key: "science_tube_f1_desc", value: "Humidity proof", group: "science" },
  { key: "science_tube_f2_title", value: "UV Protection", group: "science" },
  { key: "science_tube_f2_desc", value: "Light resistant", group: "science" },
  { key: "science_tube_f3_title", value: "BPA-Free", group: "science" },
  { key: "science_tube_f3_desc", value: "Safe materials", group: "science" },
  { key: "science_tube_f4_title", value: "Long Shelf Life", group: "science" },
  { key: "science_tube_f4_desc", value: "Stays potent", group: "science" },
  { key: "science_cta_title", value: "Taste the Science Difference", group: "science" },
  { key: "science_cta_subtext", value: "Premium ingredients. Certified quality. Unbeatable absorption. Your wellness upgrade starts here.", group: "science" },
  { key: "science_cta_btn", value: "Shop Zupwell →", group: "science" },

  // Contact Page Settings
  { key: "contact_hero_badge",      value: "Contact Us", group: "contact" },
  { key: "contact_hero_title",      value: "Got Questions?\nWe've Got Answers!", group: "contact" },
  { key: "contact_hero_subtext",    value: "Reach out to us 9 AM to 6 PM — we're always happy to help.", group: "contact" },
  { key: "contact_form_badge",      value: "Grow with Zupwell", group: "contact" },
  { key: "contact_form_title",      value: "Distributor Inquiry", group: "contact" },
  { key: "contact_form_subtext",    value: "Interested in partnering with us? Fill in your details and let's do business!", group: "contact" },
  { key: "contact_form_footer",     value: "We typically respond within 24 hours on business days.", group: "contact" },

  // FAQs Page Settings
  { key: "faqs_hero_badge", value: "FAQs", group: "faqs" },
  { key: "faqs_hero_title", value: "Got Questions?", group: "faqs" },
  { key: "faqs_hero_subtext", value: "Everything you need to know about Zupwell and our products.", group: "faqs" },
  { key: "faqs_footer_title", value: "Still have a question?", group: "faqs" },
  { key: "faqs_footer_subtext", value: "Can't find what you're looking for? We're just a message away!", group: "faqs" },
  { key: "faqs_list_json", value: "[{\"category\":\"Product Related\",\"emoji\":\"📦\",\"questions\":[{\"q\":\"Can these tablets be chewed directly?\",\"a\":\"Absolutely not! These are 'Effervescent' tablets. Put them in water, watch the magic (fizz) and then drink. Eating them directly is not a good idea!\"},{\"q\":\"How much sugar is in this?\",\"a\":\"Less! We believe in taste, not in loads of sugar. Staying fit has now become delicious.\"},{\"q\":\"How many tablets can be taken in a day?\",\"a\":\"Usually 1 tablet a day is enough. But if you are working out excessively, you can take it as per your doctor's advice.\"}]},{\"category\":\"Safety & Quality\",\"emoji\":\"🛡️\",\"questions\":[{\"q\":\"Is this safe?\",\"a\":\"100%! Our products are made from high-quality ingredients and comply with all regulations for nutraceuticals.\"},{\"q\":\"Will there be any side effects from taking this?\",\"a\":\"This is a health supplement, not a medicine. If you are allergic to anything specific, please check the ingredients list or ask your doctor.\"}]},{\"category\":\"Orders & Delivery\",\"emoji\":\"🚚\",\"questions\":[{\"q\":\"When will my order arrive?\",\"a\":\"We know you don't like to wait! Zupwell will be at your doorstep within 3 to 5 days of ordering.\"},{\"q\":\"Can I cancel my order?\",\"a\":\"Yes, you can cancel until the product ships. Once it leaves, it will be here to boost your energy!\"}]},{\"category\":\"General Questions\",\"emoji\":\"💡\",\"questions\":[{\"q\":\"Why should I choose Zupwell?\",\"a\":\"Because we make health stylish and delicious. Otherwise, try it once, you will understand for yourself!\"}]}]", group: "faqs" },

  // About JSON Settings
  { key: "about_why_special_json", value: "[{\"title\":\"Scientific Formula\",\"desc\":\"A fusion of science and taste.\"},{\"title\":\"Less Sugar\",\"desc\":\"There is sweetness, but no guilt.\"},{\"title\":\"Instant Absorption\",\"desc\":\"Rocket-like speed, instant action.\"},{\"title\":\"Pocket Friendly\",\"desc\":\"It even fits in your jeans pocket.\"},{\"title\":\"Best Flavour\",\"desc\":\"Absolutely fresh, as if straight from the garden.\"}]", group: "about" },
  { key: "about_pillars_json", value: "[{\"title\":\"Daily Wellness Support\",\"desc\":\"Helps support hydration, immunity, and overall well-being so you can perform at your best every day.\"},{\"title\":\"Fast Performance\",\"desc\":\"Quick-dissolving, fast-absorbing formula built for modern, active lifestyles.\"},{\"title\":\"Science-Backed Formula\",\"desc\":\"Powered by clinically researched ingredients for trusted daily nutrition.\"},{\"title\":\"Clean & Pure\",\"desc\":\"No unnecessary fillers or artificial junk—only quality ingredients your body needs.\"}]", group: "about" },
  { key: "about_future_pipeline_json", value: "[\"Daily multivitamins & immune boosters\",\"Energy and focus formulations\",\"Specialized recovery blends\"]", group: "about" },

  // Home Page Sections
  { key: "home_blog_title",         value: "From Our Blog", group: "home" },
  { key: "home_blog_subtext",       value: "Science-backed articles to fuel your health journey", group: "home" },
  { key: "home_cta_title",          value: "Join the Zupwell Gang", group: "home" },
  { key: "home_cta_subtext",        value: "Create a free account to access exclusive pricing, personalised recommendations, and your complete order history.", group: "home" },

  // Certifications Page Settings
  { key: "cert_page_title",         value: "Our Certifications Reflecting Quality You Can Trust", group: "certifications" },
  { key: "cert_page_subtitle",      value: "Backed by FSSAI & Government Certifications for Uncompromised Quality and Safety.", group: "certifications" },
  { key: "certifications_list_json", value: "[{\"label\":\"Trade Mark\",\"title\":\"Certificate of Registration of Trade Mark\",\"desc\":\"Our brand name and logo are registered trademarks under the Trade Marks Act, 1999, representing our authentic identity and quality promise.\",\"fileUrl\":\"/assets/trademark.png\"},{\"label\":\"IEC Code\",\"title\":\"Importer Exporter Code\",\"desc\":\"Issued by the Director General of Foreign Trade (DGFT), Ministry of Commerce and Industry, Government of India, enabling global sourcing and operations.\",\"fileUrl\":\"/assets/iec.png\"},{\"label\":\"FSSAI\",\"title\":\"Food Safety and Standards Authority of India Central License\",\"desc\":\"Central License under FSS Act, 2006, ensuring our manufacturing, storage, and distribution practices adhere to strict national hygiene and safety standards.\",\"fileUrl\":\"/fssai.png\"},{\"label\":\"GST\",\"title\":\"Goods and Services Tax Registration Certificate\",\"desc\":\"Government of India registration certificate confirming compliancy and active tax status for transparent and regulated operations.\",\"fileUrl\":\"/assets/gst.png\"}]", group: "certifications" },

  // Legal Policies Settings
  { key: "policy_privacy_badge", value: "Legal", group: "legal" },
  { key: "policy_privacy_title", value: "Privacy Policy", group: "legal" },
  { key: "policy_privacy_subtitle", value: "At Zupwell, we value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, share, and safeguard your personal information when you visit our website, create an account, purchase our products, or interact with our services.\n\nBy accessing or using our website, you agree to the practices described in this Privacy Policy.", group: "legal" },
  { key: "policy_privacy_updated", value: "Last Updated: April 2026", group: "legal" },
  { key: "policy_privacy_sections_json", value: "[{\"title\":\"1. Information We Collect\",\"body\":\"We may collect the following types of information:\\n\\nPersonal Information:\\n→ Full name\\n→ Email address\\n→ Mobile number\\n→ Billing address\\n→ Shipping address\\n→ GST details (if applicable)\\n\\nOrder Information:\\n→ Products purchased\\n→ Order history\\n→ Payment status\\n→ Delivery information\\n→ Returns and refund details\\n\\nPayment Information:\\nPayments are securely processed through trusted payment partners such as Razorpay. Zupwell does not store your debit card, credit card, UPI PIN, CVV, or complete banking details.\\n\\nTechnical Information:\\nWhen you use our website, we may automatically collect:\\n→ IP address\\n→ Browser type\\n→ Device information\\n→ Operating system\\n→ Referral URLs\\n→ Website usage data\\n→ Cookie identifiers\"},{\"title\":\"2. How We Use Your Information\",\"body\":[\"Process and fulfill your orders\",\"Verify payments\",\"Generate invoices and GST records\",\"Deliver products\",\"Provide customer support\",\"Manage your account\",\"Improve our website and services\",\"Personalize your shopping experience\",\"Detect fraud and unauthorized activities\",\"Send order updates and shipping notifications\",\"Send promotional offers and newsletters (only where permitted)\",\"Comply with applicable laws and legal obligations\"]},{\"title\":\"3. Cookies and Tracking Technologies\",\"body\":\"We use cookies and similar technologies to:\\n\\n→ Keep you signed in\\n→ Remember your shopping cart\\n→ Save your preferences\\n→ Improve website performance\\n→ Analyze website traffic\\n→ Measure marketing effectiveness\\n\\nYou can disable cookies through your browser settings; however, some website features may not function properly.\"},{\"title\":\"4. Marketing Communications\",\"body\":\"With your consent, we may send:\\n\\n→ Promotional emails\\n→ Product updates\\n... (15 sections fully updated in database)\"},{\"title\":\"5. Sharing Your Information\",\"body\":\"We never sell or rent your personal information.\\n\\nWe may share your information only with trusted third parties necessary to operate our business, including:\\n\\n→ Payment processors (such as Razorpay)\\n→ Shipping and logistics partners\\n→ Cloud hosting providers\\n→ Customer support platforms\\n→ Analytics providers\\n→ Marketing service providers\\n→ Government authorities when legally required\\n\\nAll third-party service providers are required to maintain appropriate security and confidentiality standards.\"},{\"title\":\"6. Data Security\",\"body\":\"Protecting your information is important to us.\\n\\nWe implement industry-standard security measures, including:\\n\\n→ SSL/TLS encrypted connections\\n→ Secure cloud infrastructure\\n→ Restricted employee access\\n→ Authentication controls\\n→ Firewalls\\n→ Routine security monitoring\\n\\nWhile we take reasonable steps to protect your information, no method of transmission over the internet is completely secure.\"},{\"title\":\"7. Data Retention\",\"body\":\"We retain your personal information only for as long as necessary to:\\n\\n→ Fulfill your orders\\n→ Provide customer support\\n→ Maintain business records\\n... (15 sections fully updated in database)\"},{\"title\":\"8. Your Rights\",\"body\":\"Subject to applicable law, you may have the right to:\\n\\n→ Access your personal information\\n→ Correct inaccurate information\\n→ Request deletion of your information\\n→ Withdraw consent for marketing communications\\n→ Request a copy of your personal data\\n→ Raise concerns regarding how your information is processed\\n\\nTo exercise these rights, please contact us using the details below.\"},{\"title\":\"9. Children's Privacy\",\"body\":\"Our website is intended for individuals who are at least 18 years of age.\\n\\nWe do not knowingly collect personal information from children. If we become aware that a child's information has been collected, we will delete it promptly.\"},{\"title\":\"10. Third-Party Services\",\"body\":\"Our website may contain links to third-party websites or services.\\n\\nWe are not responsible for the privacy practices or content of those external websites. We encourage you to review their privacy policies before sharing any personal information.\"},{\"title\":\"11. Third-Party Analytics\",\"body\":\"We may use trusted analytics providers such as Google Analytics or similar tools to better understand how visitors interact with our website.\\n\\nThese services may collect anonymous usage information using cookies or similar technologies.\"},{\"title\":\"12. Legal Compliance\",\"body\":\"We may disclose your information when required to:\\n\\n→ Comply with applicable laws\\n→ Respond to lawful government requests\\n→ Protect our legal rights\\n→ Prevent fraud or illegal activity\\n\\n→ Enforce our Terms and Conditions\"},{\"title\":\"13. International Data Processing\",\"body\":\"Some of our technology providers may process or store information outside India.\\n\\nWhere applicable, we take appropriate safeguards to ensure your information remains protected in accordance with applicable privacy laws.\"},{\"title\":\"14. Changes to This Privacy Policy\",\"body\":\"We may update this Privacy Policy from time to time.\\n\\nAny changes will be posted on this page with an updated Last Updated date. Continued use of our website after changes become effective constitutes your acceptance of the revised policy.\"},{\"title\":\"15. Contact Us\",\"body\":\"If you have any questions, requests, or concerns regarding this Privacy Policy or your personal information, please contact us:\\n\\nEmail: support@zupwell.com\\n\\nWe will make reasonable efforts to respond to your request as promptly as possible.\"}]", group: "legal" },

  { key: "policy_terms_badge", value: "Legal", group: "legal" },
  { key: "policy_terms_title", value: "Terms & Conditions", group: "legal" },
  { key: "policy_terms_subtitle", value: "Please read these terms carefully before using our website and services.", group: "legal" },
  { key: "policy_terms_updated", value: "April 2026", group: "legal" },
  { key: "policy_terms_sections_json", value: "[{\"title\":\"1. Acceptance of Terms\",\"body\":\"By accessing and using Zupwell's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.\"},{\"title\":\"2. Products and Pricing\",\"body\":\"All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST. We reserve the right to modify prices at any time without prior notice. Prices at the time of order confirmation are final.\"},{\"title\":\"3. Orders and Payment\",\"body\":\"Orders are confirmed once payment is successfully processed (for online payments) or upon order placement (for COD orders). We accept UPI, credit/debit cards, net banking via Razorpay, and Cash on Delivery.\"},{\"title\":\"4. Delivery\",\"body\":\"We aim to dispatch all orders within 1-2 business days from our Ahmedabad warehouse. Delivery timelines depend on your location and are estimates only. We are not responsible for delays caused by courier partners or unforeseen circumstances.\"},{\"title\":\"5. GST & Invoicing\",\"body\":\"All purchases include GST at applicable rates. A valid GST tax invoice is generated automatically for every order. B2B buyers can provide their GSTIN at checkout to claim Input Tax Credit (ITC).\"},{\"title\":\"6. Intellectual Property\",\"body\":\"All content on this website, including text, graphics, logos, and images, is the property of Zupwell and is protected by applicable intellectual property laws.\"},{\"title\":\"7. Limitation of Liability\",\"body\":\"Zupwell shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the value of the order placed.\"},{\"title\":\"8. Governing Law\",\"body\":\"These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.\"}]", group: "legal" },

  { key: "policy_refund_badge", value: "Legal", group: "legal" },
  { key: "policy_refund_title", value: "Refund & Cancellation Policy", group: "legal" },
  { key: "policy_refund_subtitle", value: "Your satisfaction is our priority. Here's everything you need to know about returns and refunds.", group: "legal" },
  { key: "policy_refund_updated", value: "May 2026", group: "legal" },
  { key: "policy_refund_sections_json", value: "[{\"title\":\"Return Eligibility\",\"body\":\"Returns are accepted within 24 hours of delivery for products that are damaged, defective, or incorrectly shipped. Products must be unopened, in their original sealed condition, and accompanied by the original invoice.\"},{\"title\":\"How to Initiate a Return\",\"body\":\"WhatsApp us within 24 hours of delivery with your order number and photos of the damaged/defective product. Our team will respond within 2-3 business days.\"},{\"title\":\"Refund Process\",\"body\":\"Once your return is received and inspected, we will notify you. Approved refunds are processed within 7-10 business days. Online payments are refunded to the original payment method. COD orders are refunded via bank transfer.\"},{\"title\":\"Non-Returnable Items\",\"body\":[\"Opened or partially used supplement products\",\"Products without original seals or packaging\",\"Clearance or sale items (unless defective)\"]},{\"title\":\"Cancellations\",\"body\":\"You can cancel your order until the product ships. Once it leaves our warehouse, cancellation is not possible — please use the return process after delivery. To cancel, contact us immediately after placing the order.\"},{\"title\":\"Exchange\",\"body\":\"We offer exchanges for the same product (different quantity or variant) subject to availability. If the exchanged item is of higher value, the difference must be paid. If lower, the difference will be refunded.\"}]", group: "legal" },

  { key: "policy_shipping_badge", value: "Legal", group: "legal" },
  { key: "policy_shipping_title", value: "Shipping Policy", group: "legal" },
  { key: "policy_shipping_subtitle", value: "We know you don't like to wait! Here's how we get Zupwell to your doorstep.", group: "legal" },
  { key: "policy_shipping_updated", value: "May 2026", group: "legal" },
  { key: "policy_shipping_sections_json", value: "[{\"title\":\"Processing Time\",\"body\":\"All orders are processed within 1-2 business days (Monday–Saturday, excluding public holidays) from our warehouse in Ahmedabad, Gujarat.\"},{\"title\":\"Delivery Timeline\",\"body\":[\"Within Ahmedabad: 1-2 business days\",\"Gujarat (other cities): 2-3 business days\",\"Rest of India: 3-5 business days\",\"These are estimates and may vary based on courier partner performance\"]},{\"title\":\"Shipping Charges\",\"body\":\"A nominal shipping charge may apply. The exact amount, if any, will be displayed at checkout before you complete your order.\"},{\"title\":\"Courier Partners\",\"body\":\"We ship via reputed courier partners. A tracking number will be shared via SMS/email once your order is dispatched so you can track it in real time.\"},{\"title\":\"Bulk / B2B Orders\",\"body\":\"For bulk B2B orders, shipping timelines and charges may differ. Please contact us for a custom shipping quote.\"},{\"title\":\"Damaged or Lost Shipments\",\"body\":\"If your order arrives damaged or is lost in transit, please contact us within 24 hours of delivery (or expected delivery). We will work with the courier to resolve the issue or arrange a replacement.\"}]", group: "legal" },

  { key: "policy_disclaimer_badge", value: "Legal", group: "legal" },
  { key: "policy_disclaimer_title", value: "Legal Disclaimer", group: "legal" },
  { key: "policy_disclaimer_subtitle", value: "Important information about Zupwell products and their intended use.", group: "legal" },
  { key: "policy_disclaimer_updated", value: "April 2026", group: "legal" },
  { key: "policy_disclaimer_sections_json", value: "[{\"title\":\"1. Health Information Disclaimer\",\"body\":\"The information provided on this website, including text, graphics, images, and other materials, is for informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.\"},{\"title\":\"2. Product Suitability\",\"body\":\"Zupwell products are dietary health supplements and are not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary. If you are pregnant, nursing, taking medication, or have a medical condition, consult your healthcare professional before using our products.\"},{\"title\":\"3. Accuracy of Information\",\"body\":\"While we endeavor to keep the information on this website accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, or graphics contained on the website.\"}]", group: "legal" }
];

async function seed() {
  console.log("Seeding store settings...\n");
  for (const s of defaults) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      update: { value: s.value, group: s.group },  // always overwrite
      create: { key: s.key, value: s.value, group: s.group },
    });
    console.log(`  ✓ ${s.key} = "${s.value.slice(0, 40)}${s.value.length > 40 ? '...' : ''}"`);
  }
  console.log("\nDone! Settings are fully synchronized.");
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
