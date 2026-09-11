"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Language = "hi" | "en";
type UserRole = "student" | "admin";

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");
  const [role, setRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const t = {
    hi: {
      topBar: {
        rules: "Rules & Regulations / नियम एवं विनियम",
        feeStructure: "शुल्क संरचना (Fee Structure)",
        approved: "बिहार सरकार / Govt. of Bihar Approved",
        langLabel: "भाषा चुनें",
        langOptionHi: "हिंदी (Hindi)",
        langOptionEn: "English",
      },
      header: {
        dept: "DSTTE, बिहार सरकार",
        estd: "स्थापना 2019",
        collegeName: "राजकीय अभियंत्रण महाविद्यालय, मुंगेर",
        collegeSub: "Government Engineering College, Munger",
        systemBadge: "छात्रावास प्रबंधन प्रणाली (Hostel Management System - HMS)",
        hours: "10:00 AM – 5:00 PM",
        workingDays: "(कार्य दिवस / Working Days)",
        phone: "+91 6344 299901",
        email: "hostel.gecmunger@gmail.com",
        updateTag: "सूचना / Update",
        marquee:
          "शैक्षणिक सत्र 2025-26 के प्रथम एवं द्वितीय वर्ष के छात्र/छात्राओं हेतु छात्रावास नामांकन खिड़की प्रारंभ हो चुकी है। आवेदन की अंतिम तिथि: 25 अगस्त 2026 तक। • Nightly roll-call selfie window is active between 7:00 PM to 8:00 PM daily. • Please keep parent contact and Aadhaar ready before applying.",
      },
      hero: {
        campusTag: "छात्र-छात्राओं हेतु आवासीय परिसर",
        sessionOpen: "सत्र 2025–26 खुला है",
        heroHeading: "डिजिटल हॉस्टल आवंटन, बायो-अटेंडेंस एवं छात्र सेवा पोर्टल",
        heroDesc:
          "महाविद्यालय में अध्ययनरत विद्यार्थियों के लिए सुरक्षित, सुव्यवस्थित एवं डिजिटल छात्रावास प्रबंधन प्रणाली। पारदर्शी कमरा आवंटन, दैनिक 7-8 PM लोकेशन आधारित बायो-हाजिरी, एवं मेस सुविधा।",
        metric1Val: "Boys & Girls",
        metric1Sub: "2 हॉस्टल श्रेणियां",
        metric2Val: "डिजिटल कक्ष आवंटन",
        metric2Sub: "Bed, Room & Furniture ID",
        metric3Val: "7–8 PM हाजिरी",
        metric3Sub: "लोकेशन आधारित बायो-हाजिरी",
        noticeTitle: "सूचना पट्ट / Notice Board",
        noticeSub: "नवीनतम दिशा-निर्देश एवं परिपत्र (Official Circulars)",
        viewAll: "सभी देखें",
        verified: "मुख्य वार्डन कार्यालय द्वारा सत्यापित",
        archive: "पुराने सर्कुलर आर्काइव →",
        notices: [
          {
            month: "AUG",
            day: "18",
            badge: "नामांकन",
            badgeColor: "bg-red-600",
            ref: "Ref: GEC/HMS/2026/092",
            title: "सत्र 2025-26 छात्रावास प्रवेश प्रपत्र एवं सीट आवंटन",
            desc: "सत्र 2025-26 के चयनित छात्र-छात्राएं प्रवेश प्रपत्र, शपथ पत्र एवं आवश्यक दस्तावेज वार्डन कार्यालय में 25 अगस्त 2026 तक अनिवार्य रूप से जमा करें।",
            links: [
              {
                icon: "fa-regular fa-file-pdf",
                text: "प्रवेश प्रपत्र (Admission Form PDF)",
                href: "#admission-form",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "शुल्क संरचना देखें (Fee Structure PDF)",
                href: "#fee-structure",
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
              },
              {
                icon: "fa-solid fa-book-bookmark",
                text: "नियम व विनियम (Rules & Regulations)",
                href: "#rules-modal",
                color: "text-slate-700 bg-slate-100 border-slate-300",
              },
            ],
          },
          {
            month: "AUG",
            day: "15",
            badge: "Asset Blueprint",
            badgeColor: "bg-blue-600",
            ref: "Ref: GEC/HMS/2026/088",
            title: "कमरा एवं फर्नीचर ब्लूप्रिंट मैपिंग (Bed, Table & Chair ID)",
            desc: "वार्डन डैशबोर्ड पर प्रत्येक कक्ष के लिए विशिष्ट परिसंपत्ति पहचान संख्या अंकित कर दी गई है। आवंटन सूची में अपना नाम व फर्नीचर आईडी सत्यापित करें।",
            links: [
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "आदेश पत्र डाउनलोड (Download Circular)",
                href: "#blueprint-pdf",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
              {
                icon: "fa-solid fa-book-bookmark",
                text: "संपत्ति संरक्षण नियम (Asset Guidelines)",
                href: "#rules-modal",
                color: "text-amber-700 bg-amber-50 border-amber-200",
              },
            ],
          },
          {
            month: "AUG",
            day: "10",
            badge: "Mess Rebate",
            badgeColor: "bg-emerald-600",
            ref: "Ref: GEC/HMS/2026/085",
            title: "मेस रिबेट एवं दैनिक उपस्थिति संबंधी दिशा-निर्देश",
            desc: "स्वीकृत अवकाश एवं दैनिक 7-8 PM बायो-अटेंडेंस सत्यापन के आधार पर मासिक मेस शुल्क में पारदर्शी छूट लागू करने हेतु नियम जारी किए गए हैं।",
            links: [
              {
                icon: "fa-solid fa-utensils",
                text: "मेस रिबेट नियम (Mess Rebate Policy)",
                href: "#mess-rebate",
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
              },
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "रिबेट आवेदन फॉर्म (Rebate Application)",
                href: "#rebate-form",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
            ],
          },
        ],
        campusLifeBadge: "जीवंत छात्र समुदाय / Vibrant Campus Life",
        campusLifeDesc:
          "जीईसी मुंगेर के छात्र-छात्राएं परिसर छात्रावासों में सुरक्षित एवं अनुशासित वातावरण में शिक्षा प्राप्त कर रहे हैं।",
      },
      login: {
        badge: "अधिकृत लॉगिन / Portal Login",
        title: "हॉस्टल पोर्टल में प्रवेश करें",
        tabStudent: "छात्र (Student)",
        tabAdmin: "प्रशासक (Warden / Admin)",
        emailLabel: "आधिकारिक ईमेल (Official Email Address)",
        emailPlaceholderStudent: "student@gecmunger.ac.in",
        emailPlaceholderAdmin: "warden@gecmunger.ac.in",
        emailHelp: "केवल अधिकृत ईमेल आईडी द्वारा प्रवेश (Email only login)",
        passwordLabel: "पासवर्ड (Password)",
        forgotPassword: "पासवर्ड भूल गए?",
        rememberMe: "मुझे याद रखें",
        sslSecured: "256-bit SSL सुरक्षित",
        closedAlert:
          "सार्वजनिक साइन-अप बंद है। केवल वार्डन/एडमिन द्वारा जोड़े गए आवंटित (Allotted) छात्र ही लॉगिन कर सकते हैं।",
        submitBtnStudent: "छात्र पोर्टल में लॉगिन करें (Student Login)",
        submitBtnAdmin: "वार्डन पोर्टल में लॉगिन करें (Warden Login)",
        newApplicantTitle: "सूचना: नए आवेदकों के लिए (Important Note for Applicants)",
        newApplicantDesc:
          "वार्डन/प्रशासन द्वारा आवेदन सत्यापित होने एवं स्थिति 'आवंटित (Allotted)' अथवा 'प्रतीक्षारत (Waiting)' अपडेट होने के उपरांत ही छात्र इस पोर्टल में अपने पंजीकृत ईमेल से लॉगिन कर सकते हैं।",
        btnGuidelines: "प्रवेश प्रक्रिया एवं नियम (Admission Process & Guidelines)",
        btnFeeStructure: "शुल्क संरचना (Fee Structure)",
      },
      footer: {
        college: "राजकीय अभियंत्रण महाविद्यालय, मुंगेर (GEC Munger)",
        dept: "विज्ञान, प्रावैधिकी एवं तकनीकी शिक्षा विभाग, बिहार सरकार के अधीन",
        rules: "छात्रावास आचार संहिता",
        antiRagging: "एंटी-रैगिंग शपथ",
        messRebate: "मेस रिबेट नियम",
        helpline: "हेल्पलाइन (10AM - 5PM)",
        copyright: "© 2026 GEC Munger HMS. सर्वाधिकार सुरक्षित।",
        missionBadge: "मिशन 38 (Mission 38)",
        missionTagline: "38 इंजीनियरिंग कॉलेज • एक मिशन • एक डिजिटल भविष्य",
        developedBy: "विकसित एवं संचालित:",
        foundationName: "NextOdyssey Technology Foundation",
      },
    },
    en: {
      topBar: {
        rules: "Rules & Regulations / Guidelines",
        feeStructure: "Fee Structure",
        approved: "Approved by Govt. of Bihar",
        langLabel: "Select Language",
        langOptionHi: "हिंदी (Hindi)",
        langOptionEn: "English",
      },
      header: {
        dept: "DSTTE, Govt. of Bihar",
        estd: "Estd. 2019",
        collegeName: "Government Engineering College, Munger",
        collegeSub: "Rajkiya Abhiyantran Mahavidyalaya, Munger",
        systemBadge: "Hostel Management System (HMS Portal)",
        hours: "10:00 AM – 5:00 PM",
        workingDays: "(Working Days)",
        phone: "+91 6344 299901",
        email: "hostel.gecmunger@gmail.com",
        updateTag: "Notice / Update",
        marquee:
          "Hostel admission window for 1st & 2nd year students of Academic Session 2025-26 is now active. Last date to submit: 25th August 2026. • Nightly roll-call selfie window is active between 7:00 PM to 8:00 PM daily. • Keep parent contact and Aadhaar ready before applying.",
      },
      hero: {
        campusTag: "Residential Campus for Students",
        sessionOpen: "Session 2025–26 Open",
        heroHeading: "Digital Hostel Allocation, Bio-Attendance & Student Services",
        heroDesc:
          "A secure, disciplined, and digitally automated hostel residency system for GEC Munger students. Transparent room allocation, nightly 7-8 PM geo-verified bio-attendance, and mess rebate management.",
        metric1Val: "Boys & Girls",
        metric1Sub: "2 Hostel Categories",
        metric2Val: "Digital Room Allocation",
        metric2Sub: "Bed, Room & Furniture ID",
        metric3Val: "7–8 PM Roll Call",
        metric3Sub: "Geo-fenced Bio-Attendance",
        noticeTitle: "Notice Board & Circulars",
        noticeSub: "Latest Official Directives & Circulars",
        viewAll: "View All",
        verified: "Verified by Chief Warden Office",
        archive: "Notice Archive →",
        notices: [
          {
            month: "AUG",
            day: "18",
            badge: "Admission",
            badgeColor: "bg-red-600",
            ref: "Ref: GEC/HMS/2026/092",
            title: "Session 2025-26 Hostel Admission Form & Seat Allocation",
            desc: "Selected candidates for session 2025-26 must submit their admission forms, affidavits, and requisite documents to the Warden Office by 25th August 2026.",
            links: [
              {
                icon: "fa-regular fa-file-pdf",
                text: "Admission Form (PDF)",
                href: "#admission-form",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "Fee Structure (PDF)",
                href: "#fee-structure",
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
              },
              {
                icon: "fa-solid fa-book-bookmark",
                text: "Rules & Regulations",
                href: "#rules-modal",
                color: "text-slate-700 bg-slate-100 border-slate-300",
              },
            ],
          },
          {
            month: "AUG",
            day: "15",
            badge: "Asset Blueprint",
            badgeColor: "bg-blue-600",
            ref: "Ref: GEC/HMS/2026/088",
            title: "Room & Furniture Blueprint Mapping (Bed, Table & Chair ID)",
            desc: "Distinct asset identification numbers for every room are updated on the Warden Dashboard. Kindly verify your name and assigned furniture IDs.",
            links: [
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "Download Circular",
                href: "#blueprint-pdf",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
              {
                icon: "fa-solid fa-book-bookmark",
                text: "Asset Guidelines",
                href: "#rules-modal",
                color: "text-amber-700 bg-amber-50 border-amber-200",
              },
            ],
          },
          {
            month: "AUG",
            day: "10",
            badge: "Mess Rebate",
            badgeColor: "bg-emerald-600",
            ref: "Ref: GEC/HMS/2026/085",
            title: "Mess Rebate & Daily Attendance Directives",
            desc: "Rules for monthly mess bill rebates based on approved leave slips and verified 7-8 PM daily biometric attendance have been officially notified.",
            links: [
              {
                icon: "fa-solid fa-utensils",
                text: "Mess Rebate Policy",
                href: "#mess-rebate",
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
              },
              {
                icon: "fa-solid fa-file-invoice-dollar",
                text: "Rebate Application Form",
                href: "#rebate-form",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
            ],
          },
        ],
        campusLifeBadge: "Vibrant Campus Life",
        campusLifeDesc:
          "Students of GEC Munger reside and excel in a secure, disciplined, and technologically equipped residential campus.",
      },
      login: {
        badge: "Authorized Portal Login",
        title: "Sign in to HMS Portal",
        tabStudent: "Student",
        tabAdmin: "Warden / Admin",
        emailLabel: "Official Email Address",
        emailPlaceholderStudent: "student@gecmunger.ac.in",
        emailPlaceholderAdmin: "warden@gecmunger.ac.in",
        emailHelp: "Only authorized email credentials allowed",
        passwordLabel: "Password",
        forgotPassword: "Forgot Password?",
        rememberMe: "Remember me",
        sslSecured: "256-bit SSL Secured",
        closedAlert:
          "Public sign-up is closed. Only allotted students registered by the administration can log in.",
        submitBtnStudent: "Sign In to Student Portal",
        submitBtnAdmin: "Sign In to Warden Portal",
        newApplicantTitle: "Important Note for Applicants",
        newApplicantDesc:
          "Students can log in with their registered email only after their application has been verified and their status updated to 'Allotted' or 'Waiting' by the Warden/Administration.",
        btnGuidelines: "Admission Process & Guidelines",
        btnFeeStructure: "Fee Structure",
      },
      footer: {
        college: "Government Engineering College, Munger (GEC Munger)",
        dept: "Under Department of Science, Technology & Technical Education (DSTTE), Govt. of Bihar",
        rules: "Code of Conduct",
        antiRagging: "Anti-Ragging Undertaking",
        messRebate: "Mess Rebate Policy",
        helpline: "Helpline (10AM - 5PM)",
        copyright: "© 2026 GEC Munger HMS. All rights reserved.",
        missionBadge: "MISSION 38",
        missionTagline: "38 Colleges. One Mission. Digital Transformation.",
        developedBy: "Developed & Powered by",
        foundationName: "NextOdyssey Technology Foundation",
      },
    },
  };

  const curr = t[lang];

  const adjustFontSize = (delta: number) => {
    setFontSizeOffset((prev) => {
      const next = prev + delta;
      return next >= -2 && next <= 4 ? next : prev;
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{ fontSize: `${16 + fontSizeOffset}px` }}
    >
      {/* 1. TOP UTILITY BAR (COMPACT & RESPONSIVE) */}
      <div className="bg-[#991b1b] text-white text-xs font-medium border-b border-red-900 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Rules & Regulations & Quick Links */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-[11px] sm:text-xs">
            <a
              href="#rules-modal"
              className="inline-flex items-center hover:text-amber-200 transition-colors font-semibold group"
            >
              <i className="fa-solid fa-book-bookmark mr-1.5 text-amber-300 group-hover:scale-110 transition-transform text-xs"></i>
              <span>{curr.topBar.rules}</span>
            </a>
            <span className="text-red-300 hidden md:inline">|</span>
            <a
              href="#fee-structure"
              className="hover:text-amber-200 transition-colors hidden md:inline-flex items-center"
            >
              <i className="fa-solid fa-file-invoice-dollar mr-1 text-red-200 text-xs"></i>
              <span>{curr.topBar.feeStructure}</span>
            </a>
            <span className="text-red-300 hidden lg:inline">|</span>
            <span className="text-red-100 hidden lg:inline-flex items-center">
              <i className="fa-solid fa-shield-halved mr-1 text-emerald-300 text-xs"></i>
              <span>{curr.topBar.approved}</span>
            </span>
          </div>

          {/* Right: Language Dropdown & Accessibility */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
            <div className="hidden sm:flex items-center space-x-1 text-[11px] border-r border-red-700 pr-2 mr-1 text-red-200">
              <button
                type="button"
                onClick={() => adjustFontSize(-1)}
                className="cursor-pointer hover:text-white px-1 font-medium hover:bg-red-800/50 rounded"
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeOffset(0)}
                className="cursor-pointer hover:text-white px-1 font-bold hover:bg-red-800/50 rounded"
                title="Reset Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => adjustFontSize(1)}
                className="cursor-pointer hover:text-white px-1 font-bold hover:bg-red-800/50 rounded"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-red-950/70 px-2 py-0.5 rounded border border-red-700/60 shadow-inner">
              <i className="fa-solid fa-globe text-amber-300 text-[11px]"></i>
              <label htmlFor="lang-select" className="sr-only">
                {curr.topBar.langLabel}
              </label>
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-white text-[11px] sm:text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="hi" className="text-slate-900">
                  {curr.topBar.langOptionHi}
                </option>
                <option value="en" className="text-slate-900">
                  {curr.topBar.langOptionEn}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (COMPACT HEIGHT: reduced py, optimized logo, tight layout) */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
            {/* Left: Emblem + College Identity + Software Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src="/logo.webp"
                  alt="GEC Munger Logo"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="inline-block bg-blue-100 text-blue-900 text-[8px] font-bold px-1.5 py-0.2 rounded tracking-wide uppercase border border-blue-200">
                    {curr.header.dept}
                  </span>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[8px] font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                    {curr.header.estd}
                  </span>
                </div>
                <h1 className="text-base sm:text-xl font-extrabold text-[#0f2942] tracking-tight leading-snug mt-0.5">
                  {curr.header.collegeName}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-none">
                  {curr.header.collegeSub}
                </p>
                <div className="flex items-center mt-1 space-x-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
                  <span className="text-[10px] sm:text-[9px] font-bold text-red-700 uppercase tracking-wide bg-red-50 px-1.5 py-0.5 rounded border border-red-200 truncate">
                    {curr.header.systemBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Compact Contact Box with timing, phone, email */}
            <div className="flex items-center justify-start md:justify-end pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="flex items-center space-x-2.5 text-left py-0.5">
                <div className="h-8 w-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div className="flex flex-col text-[11px] leading-tight space-y-0.5">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <i className="fa-regular fa-clock text-amber-600 text-[10px]"></i>
                    <span className="font-bold text-slate-800">{curr.header.hours}</span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      {curr.header.workingDays}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href="tel:+916344299901"
                      className="font-semibold text-slate-700 hover:text-blue-700 flex items-center transition-colors"
                    >
                      <i className="fa-solid fa-phone text-emerald-600 mr-1 text-[10px]"></i>
                      {curr.header.phone}
                    </a>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <a
                      href="mailto:hostel.gecmunger@gmail.com"
                      className="font-semibold text-slate-700 hover:text-blue-700 hidden sm:flex items-center transition-colors truncate max-w-[170px]"
                    >
                      <i className="fa-solid fa-envelope text-blue-600 mr-1 text-[10px]"></i>
                      {curr.header.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Urgent Notification Strip */}
        <div className="bg-amber-400 text-slate-950 px-3 sm:px-4 py-1 border-t border-b border-amber-500 flex items-center text-xs font-semibold shadow-inner">
          <div className="flex items-center bg-red-700 text-white px-2 py-0.5 rounded uppercase font-bold mr-2.5 flex-shrink-0 text-[10px] sm:text-[11px]">
            <i className="fa-solid fa-bullhorn mr-1 animate-bounce text-[10px]"></i>
            {curr.header.updateTag}
          </div>
          <div className="marquee-container flex-1">
            <span className="marquee-text text-[11px] sm:text-xs font-medium">
              {curr.header.marquee}
            </span>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (BIG BACKGROUND IMAGE + NOTICE BOARD + COMPACT LOGIN CARD) */}
      <main className="relative flex-1 flex items-center py-6 sm:py-8 lg:py-10 bg-slate-950 overflow-hidden">
        {/* Optimized Background Image (WebP ~220KB, High Priority, Instant Load) */}
        <div className="absolute inset-0 -z-0 overflow-hidden">
          <img
            src="/landing_page_image.webp"
            alt="GEC Munger Campus"
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover object-center pointer-events-none transform scale-100"
          />
        </div>

        {/* Backdrop Overlay for contrast and institutional feel */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0"></div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* ================= LEFT COLUMN: NOTICES & CAMPUS INTRO ================= */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {/* Campus Banner Card */}
              <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                    <i className="fa-solid fa-building-columns mr-1.5"></i>
                    {curr.hero.campusTag}
                  </span>
                  <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {curr.hero.sessionOpen}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mb-1.5 leading-snug">
                  {curr.hero.heroHeading}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {curr.hero.heroDesc}
                </p>

                {/* Key Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 flex flex-col justify-center">
                    <div className="text-sm sm:text-base font-extrabold text-amber-400 leading-tight">
                      {curr.hero.metric1Val}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {curr.hero.metric1Sub}
                    </div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 flex flex-col justify-center">
                    <div className="text-sm sm:text-base font-extrabold text-emerald-400 leading-tight">
                      {curr.hero.metric2Val}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {curr.hero.metric2Sub}
                    </div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 flex flex-col justify-center">
                    <div className="text-sm sm:text-base font-extrabold text-sky-400 leading-tight">
                      {curr.hero.metric3Val}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {curr.hero.metric3Sub}
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTICE BOARD COMPONENT */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      <i className="fa-solid fa-bullhorn"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                        {curr.hero.noticeTitle}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-blue-200">
                        {curr.hero.noticeSub}
                      </p>
                    </div>
                  </div>
                  <a
                    href="#all-notices"
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center"
                  >
                    {curr.hero.viewAll} <i className="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
                  </a>
                </div>

                {/* Notice List */}
                <div className="divide-y divide-slate-100 max-h-[260px] sm:max-h-[290px] overflow-y-auto custom-scrollbar">
                  {curr.hero.notices.map((notice, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-3.5 hover:bg-blue-50/70 transition-colors flex items-start space-x-3 group"
                    >
                      <div className="flex-shrink-0 text-center bg-red-50 text-red-800 rounded-lg p-1 w-11 border border-red-200">
                        <span className="block text-[9px] font-extrabold uppercase tracking-wide">
                          {notice.month}
                        </span>
                        <span className="block text-sm sm:text-base font-black leading-none">
                          {notice.day}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                          <span
                            className={`${notice.badgeColor} text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase`}
                          >
                            {notice.badge}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {notice.ref}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-800 mt-0.5 leading-snug">
                          {notice.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                          {notice.desc}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pt-1 border-t border-slate-100 text-[11px] font-semibold">
                          {notice.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.href}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded border transition-colors ${link.color}`}
                            >
                              <i className={`${link.icon} mr-1 text-[10px]`}></i>
                              {link.text}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer of Notice Card */}
                <div className="bg-slate-50 px-3 sm:px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center text-slate-500">
                    <i className="fa-solid fa-circle-check text-emerald-600 mr-1 text-xs"></i>
                    {curr.hero.verified}
                  </span>
                  <a
                    href="#archive"
                    className="font-semibold text-blue-800 hover:underline inline-flex items-center"
                  >
                    {curr.hero.archive}
                  </a>
                </div>
              </div>

              {/* Student Resident Community Preview (Photo Integration) */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-slate-700/80 flex items-center gap-3.5 text-white shadow-lg">
                <img
                  src="/Campus_live_1.webp"
                  alt="GEC Munger Hostel Students"
                  loading="lazy"
                  className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-xl border border-slate-600 shadow-md flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/Campus_live_1.png";
                  }}
                />
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wide">
                    {curr.hero.campusLifeBadge}
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5 leading-snug">
                    {curr.hero.campusLifeDesc}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: COMPACT & RESPONSIVE LOGIN CARD ================= */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-5 border border-slate-100 shadow-2xl relative">
                {/* Badge at top of Login Card */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center">
                      <i className="fa-solid fa-lock mr-1 text-blue-600"></i>
                      {curr.login.badge}
                    </span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1 leading-tight">
                      {curr.login.title}
                    </h3>
                  </div>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow flex-shrink-0">
                    <i className="fa-solid fa-shield-cat text-sm sm:text-base"></i>
                  </div>
                </div>

                {/* Role Selector Tabs (Decreased height, clean pill style) */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center space-x-1.5 ${role === "student"
                      ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <i className="fa-solid fa-user-graduate text-xs text-blue-800"></i>
                    <span className="text-[11px] sm:text-xs">{curr.login.tabStudent}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center space-x-1.5 ${role === "admin"
                      ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <i className="fa-solid fa-user-tie text-xs text-blue-800"></i>
                    <span className="text-[11px] sm:text-xs">{curr.login.tabAdmin}</span>
                  </button>
                </div>

                {/* Login Form (Tightened spacing) */}
                <form onSubmit={handleLogin} className="space-y-2.5">
                  {/* 1. Email-Only Field */}
                  <div>
                    <label
                      htmlFor="identifier"
                      className="block text-xs font-bold text-slate-800 mb-1"
                    >
                      {curr.login.emailLabel} <span className="text-red-600">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-envelope text-xs"></i>
                      </div>
                      <input
                        type="email"
                        id="identifier"
                        name="identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        placeholder={
                          role === "student"
                            ? curr.login.emailPlaceholderStudent
                            : curr.login.emailPlaceholderAdmin
                        }
                        className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all min-h-[38px]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                      <i className="fa-solid fa-circle-info mr-1 text-blue-600 text-[10px]"></i>
                      {curr.login.emailHelp}
                    </p>
                  </div>

                  {/* 2. Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="password"
                        className="block text-xs font-bold text-slate-800"
                      >
                        {curr.login.passwordLabel} <span className="text-red-600">*</span>
                      </label>
                      <a
                        href="#forgot-password"
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                      >
                        {curr.login.forgotPassword}
                      </a>
                    </div>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-key text-xs"></i>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="block w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all min-h-[38px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <i
                          className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"
                            } text-xs`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  {/* Remember & Security Check */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-1.5"
                      />
                      <span className="text-[11px]">{curr.login.rememberMe}</span>
                    </label>
                    <span className="text-slate-500 text-[10px] sm:text-[11px] flex items-center">
                      <i className="fa-solid fa-lock text-emerald-600 mr-1 text-[10px]"></i>
                      {curr.login.sslSecured}
                    </span>
                  </div>

                  {/* Notice Alert (Compact) */}
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] sm:text-[11px] text-amber-900 leading-tight flex items-start space-x-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 flex-shrink-0 text-xs"></i>
                    <span>{curr.login.closedAlert}</span>
                  </div>

                  {/* Error Notification */}
                  {loginError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-tight flex items-start space-x-2 animate-fadeIn">
                      <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <span className="font-bold block">Access Denied</span>
                        <span className="text-[11px] text-red-700">{loginError}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] hover:from-[#0b1f33] hover:to-[#172e6b] disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm border border-blue-900 min-h-[40px]"
                  >
                    {isLoggingIn ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {role === "student"
                            ? curr.login.submitBtnStudent
                            : curr.login.submitBtnAdmin}
                        </span>
                        <i className="fa-solid fa-arrow-right-to-bracket text-amber-300 text-xs"></i>
                      </>
                    )}
                  </button>
                </form>

                {/* New Student Registration Callout (Compact) */}
                <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs text-slate-700">
                  <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-circle-info text-blue-700 mt-0.5 flex-shrink-0 text-xs"></i>
                    <div className="w-full">
                      <p className="font-bold text-slate-900 text-[11px] mb-0.5">
                        {curr.login.newApplicantTitle}
                      </p>
                      <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-600 mb-2">
                        {curr.login.newApplicantDesc}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200 text-[10px] sm:text-[11px] font-semibold">
                        <a
                          href="#admission-guidelines"
                          className="inline-flex items-center justify-center text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 shadow-xs transition-colors"
                        >
                          <i className="fa-solid fa-book-bookmark mr-1 text-blue-600 text-[10px]"></i>
                          <span className="truncate">{curr.login.btnGuidelines}</span>
                        </a>
                        <a
                          href="#fee-structure"
                          className="inline-flex items-center justify-center text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 shadow-xs transition-colors"
                        >
                          <i className="fa-solid fa-file-invoice-dollar mr-1 text-emerald-600 text-[10px]"></i>
                          <span className="truncate">{curr.login.btnFeeStructure}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. RULES & CONTACT FOOTER BAR (COMPACT & CLEAN) */}
      <footer className="bg-[#0b1f3a] text-slate-300 text-xs border-t border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center space-x-2.5">
              <img
                src="/logo.webp"
                alt="GEC Logo"
                className="h-8 w-8 object-contain opacity-90 hidden sm:block"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div>
                <div className="text-white font-bold text-xs sm:text-sm">
                  {curr.footer.college}
                </div>
                <div className="text-slate-400 text-[10px] sm:text-[11px]">
                  {curr.footer.dept}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-slate-300 text-[11px] sm:text-xs font-medium">
              <a
                href="#rules"
                className="hover:text-amber-300 transition-colors flex items-center"
              >
                <i className="fa-solid fa-scale-balanced mr-1 text-slate-400 text-[10px]"></i>
                {curr.footer.rules}
              </a>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <a
                href="#anti-ragging"
                className="hover:text-amber-300 transition-colors flex items-center"
              >
                <i className="fa-solid fa-hand-fist mr-1 text-red-400 text-[10px]"></i>
                {curr.footer.antiRagging}
              </a>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <a
                href="#mess-rebate"
                className="hover:text-amber-300 transition-colors flex items-center"
              >
                <i className="fa-solid fa-utensils mr-1 text-emerald-400 text-[10px]"></i>
                {curr.footer.messRebate}
              </a>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <a
                href="#helpdesk"
                className="hover:text-amber-300 transition-colors flex items-center"
              >
                <i className="fa-solid fa-life-ring mr-1 text-sky-400 text-[10px]"></i>
                {curr.footer.helpline}
              </a>
            </div>

            <div className="text-slate-400 text-[10px] sm:text-[11px] text-center md:text-right">
              {curr.footer.copyright}
            </div>
          </div>

          {/* Mission 38 Initiative & Foundation Attribution Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-950/90 text-amber-400 font-extrabold border border-amber-500/30 text-[10px] tracking-wider shadow-xs">
                <i className="fa-solid fa-flag mr-1.5 text-amber-300 text-[9px]"></i>
                {curr.footer.missionBadge}
              </span>
              <span className="text-slate-300 font-medium">
                {curr.footer.missionTagline}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <span>{curr.footer.developedBy}</span>
              <a
                href="https://foundation.nextodyssey.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-200 font-bold underline decoration-amber-500/40 hover:decoration-amber-300 transition-colors inline-flex items-center group ml-0.5"
              >
                <span>{curr.footer.foundationName}</span>
                <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[9px] text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}