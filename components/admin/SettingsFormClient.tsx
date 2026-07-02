"use client";

import { useState } from "react";
import { saveSeoSettingsAction, saveBannersSettingsAction, saveHomepageSettingsAction } from "@/app/actions/adminSettings";
import { Sparkles, Save, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Globe, AlertCircle, CheckCircle2, Home, HelpCircle, Gift } from "lucide-react";

interface SettingsFormClientProps {
  initialSettings: any;
}

export default function SettingsFormClient({ initialSettings }: SettingsFormClientProps) {
  const [activeTab, setActiveTab] = useState<"SEO" | "BANNERS" | "HOMEPAGE">("SEO");
  const [seoSuccess, setSeoSuccess] = useState("");
  const [bannersSuccess, setBannersSuccess] = useState("");
  const [homeSuccess, setHomeSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // SEO State
  const [titleTemplate, setTitleTemplate] = useState(initialSettings.seo?.titleTemplate || "");
  const [defaultDescription, setDefaultDescription] = useState(initialSettings.seo?.defaultDescription || "");
  const [keywords, setKeywords] = useState(initialSettings.seo?.keywords || "");

  // Banners State
  const [banners, setBanners] = useState<any[]>(initialSettings.banners || []);

  // Homepage Sections State
  const hp = initialSettings.homepage || {};
  const [lovedCollectionsTitle, setLovedCollectionsTitle] = useState(hp.lovedCollectionsTitle || "");
  const [lovedCollectionsSubtitle, setLovedCollectionsSubtitle] = useState(hp.lovedCollectionsSubtitle || "");
  const [patternBannerHeading, setPatternBannerHeading] = useState(hp.patternBanner?.heading || "");
  const [trendingTitle, setTrendingTitle] = useState(hp.trendingTitle || "");
  const [trendingSubtitle, setTrendingSubtitle] = useState(hp.trendingSubtitle || "");
  const [perfectSareeTitle, setPerfectSareeTitle] = useState(hp.perfectSareeTitle || "");
  const [perfectSareeSubtitle, setPerfectSareeSubtitle] = useState(hp.perfectSareeSubtitle || "");
  const [categoriesTitle, setCategoriesTitle] = useState(hp.categoriesTitle || "");
  const [categoriesSubtitle, setCategoriesSubtitle] = useState(hp.categoriesSubtitle || "");
  
  // Features (Value Props)
  const [featuresTitle, setFeaturesTitle] = useState(hp.featuresTitle || "");
  const [featuresSubtitle, setFeaturesSubtitle] = useState(hp.featuresSubtitle || "");
  const [features, setFeatures] = useState<any[]>(
    hp.features || [
      { title: "", description: "", image: "" },
      { title: "", description: "", image: "" },
      { title: "", description: "", image: "" }
    ]
  );

  // FAQs
  const [faqTitle, setFaqTitle] = useState(hp.faqTitle || "");
  const [faqSubtitle, setFaqSubtitle] = useState(hp.faqSubtitle || "");
  const [faqImage, setFaqImage] = useState(hp.faqImage || "");
  const [faqs, setFaqs] = useState<any[]>(hp.faqs || []);

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSeoSuccess("");
    setLoading(true);

    try {
      const res = await saveSeoSettingsAction({
        titleTemplate,
        defaultDescription,
        keywords,
      });

      if (res.success) {
        setSeoSuccess("SEO Settings saved successfully!");
      } else {
        setError(res.error || "Failed to save SEO settings.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanners = async () => {
    setError("");
    setBannersSuccess("");
    setLoading(true);

    for (const b of banners) {
      if (!b.imageUrl) {
        setError("All slides must have an Image URL.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await saveBannersSettingsAction(banners);
      if (res.success) {
        setBannersSuccess("Homepage Banner slides saved successfully!");
      } else {
        setError(res.error || "Failed to save banners.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHomepage = async () => {
    setError("");
    setHomeSuccess("");
    setLoading(true);

    try {
      const res = await saveHomepageSettingsAction({
        lovedCollectionsTitle,
        lovedCollectionsSubtitle,
        patternBanner: { heading: patternBannerHeading },
        trendingTitle,
        trendingSubtitle,
        perfectSareeTitle,
        perfectSareeSubtitle,
        categoriesTitle,
        categoriesSubtitle,
        featuresTitle,
        featuresSubtitle,
        features,
        faqTitle,
        faqSubtitle,
        faqImage,
        faqs
      });

      if (res.success) {
        setHomeSuccess("Homepage layout configuration saved successfully!");
      } else {
        setError(res.error || "Failed to save homepage layout.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Banner list controls
  const handleAddBanner = () => {
    setBanners([
      ...banners,
      {
        id: `slide_${Date.now()}`,
        imageUrl: "",
        title: "",
        subtitle: "",
        buttonText: "Explore Now",
        link: "/collections/all",
      },
    ]);
  };

  const handleRemoveBanner = (index: number) => {
    setBanners(banners.filter((_, idx) => idx !== index));
  };

  const handleBannerChange = (index: number, key: string, val: string) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], [key]: val };
    setBanners(updated);
  };

  const moveBanner = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === banners.length - 1) return;
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBanners(updated);
  };

  // Feature controls
  const handleFeatureChange = (index: number, key: string, val: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [key]: val };
    setFeatures(updated);
  };

  // FAQ controls
  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const handleFaqChange = (index: number, key: "question" | "answer", val: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [key]: val };
    setFaqs(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-850">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Site Settings & SEO <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          </h1>
          <p className="text-xs text-neutral-400">Configure global metadata, search tags, and homepage layout blocks.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-neutral-850 rounded-lg bg-neutral-950 p-1">
          {(["SEO", "BANNERS", "HOMEPAGE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError("");
                setSeoSuccess("");
                setBannersSuccess("");
                setHomeSuccess("");
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-maroonClr text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab === "SEO" ? "SEO & META" : tab === "BANNERS" ? "HERO SLIDES" : "HOMEPAGE SECTIONS"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: SEO */}
      {activeTab === "SEO" && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-sm space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
            <Globe className="w-5 h-5 text-goldClr" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Search Engine Optimization</h3>
          </div>

          {seoSuccess && (
            <div className="p-3.5 bg-green-950/40 border border-green-900/50 text-green-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{seoSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSEO} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Meta Title Template</label>
              <input
                type="text"
                required
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                placeholder="%s | Boutiique Vastraa"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-maroonClr font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Meta Description Template</label>
              <textarea
                required
                rows={3}
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                placeholder="Site-wide default meta description..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-maroonClr leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">SEO Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="sarees, banarasi, ethnic wear, handloom"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-maroonClr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-maroonClr hover:bg-[#A30C4D] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-maroonClr/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving Settings..." : "Save SEO Settings"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Banners */}
      {activeTab === "BANNERS" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-goldClr" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Homepage Banner Slide Editor</h3>
            </div>
            <button
              onClick={handleAddBanner}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C9A84C]" /> Add New Slide
            </button>
          </div>

          {bannersSuccess && (
            <div className="p-3.5 bg-green-950/40 border border-green-900/50 text-green-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{bannersSuccess}</span>
            </div>
          )}

          <div className="space-y-6">
            {banners.map((slide, index) => (
              <div 
                key={slide.id} 
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-750 transition-all rounded-xl p-6 shadow-sm space-y-4 relative"
              >
                <div className="absolute right-4 top-4 flex gap-1">
                  <button
                    onClick={() => moveBanner(index, "UP")}
                    disabled={index === 0}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveBanner(index, "DOWN")}
                    disabled={index === banners.length - 1}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveBanner(index)}
                    className="p-1.5 bg-neutral-900 hover:bg-red-950/50 text-neutral-500 hover:text-red-400 rounded border border-neutral-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest pb-2 border-b border-neutral-900">
                  Slide #{index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Slide Image Path or URL</label>
                      <input
                        type="text"
                        placeholder="/images/banner-custom.jpg"
                        value={slide.imageUrl}
                        onChange={(e) => handleBannerChange(index, "imageUrl", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Slide Title / Headline</label>
                      <input
                        type="text"
                        placeholder="Festive Collection"
                        value={slide.title}
                        onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Subheading / Description</label>
                      <input
                        type="text"
                        placeholder="Discover linen sarees"
                        value={slide.subtitle}
                        onChange={(e) => handleBannerChange(index, "subtitle", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Button text</label>
                        <input
                          type="text"
                          value={slide.buttonText}
                          onChange={(e) => handleBannerChange(index, "buttonText", e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Click Action Link</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => handleBannerChange(index, "link", e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {banners.length > 0 && (
            <button
              onClick={handleSaveBanners}
              disabled={loading}
              className="bg-maroonClr hover:bg-[#A30C4D] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-maroonClr/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving Slideshow..." : "Save Banners Layout"}
            </button>
          )}
        </div>
      )}

      {/* Tab 3: Homepage Sections */}
      {activeTab === "HOMEPAGE" && (
        <div className="space-y-6 pb-12">
          
          <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-goldClr" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Homepage Copy & Text Configurator</h3>
            </div>
            {homeSuccess && (
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          {homeSuccess && (
            <div className="p-3.5 bg-green-950/40 border border-green-900/50 text-green-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{homeSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Section Headings */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest pb-2 border-b border-neutral-900">
                1. Main Title Copy & Text Blocks
              </h3>

              {/* Collections Title */}
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Section 1: Loved Collections Title</label>
                <input
                  type="text"
                  value={lovedCollectionsTitle}
                  onChange={(e) => setLovedCollectionsTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                />
              </div>

              {/* Pattern Banner Heading */}
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Section 2: Pattern Banner Text</label>
                <input
                  type="text"
                  value={patternBannerHeading}
                  onChange={(e) => setPatternBannerHeading(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                />
              </div>

              {/* Trending Title */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Section 3: Trending Title</label>
                  <input
                    type="text"
                    value={trendingTitle}
                    onChange={(e) => setTrendingTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Trending Subtitle</label>
                  <textarea
                    rows={2}
                    value={trendingSubtitle}
                    onChange={(e) => setTrendingSubtitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr leading-relaxed"
                  />
                </div>
              </div>

              {/* Perfect Saree Title */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Section 4: Perfect Saree Title</label>
                  <input
                    type="text"
                    value={perfectSareeTitle}
                    onChange={(e) => setPerfectSareeTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Perfect Saree Subtitle</label>
                  <input
                    type="text"
                    value={perfectSareeSubtitle}
                    onChange={(e) => setPerfectSareeSubtitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                  />
                </div>
              </div>

              {/* Categories Title */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Section 5: Explore Categories Title</label>
                  <input
                    type="text"
                    value={categoriesTitle}
                    onChange={(e) => setCategoriesTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Categories Subtitle</label>
                  <textarea
                    rows={2}
                    value={categoriesSubtitle}
                    onChange={(e) => setCategoriesSubtitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-maroonClr leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Value Propositions & FAQs */}
            <div className="space-y-6">
              
              {/* Block A: Value Propositions */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest pb-2 border-b border-neutral-900 flex items-center gap-1">
                  <Gift className="w-4 h-4" /> 2. Section 6: Value Proposition Cards
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Features Heading</label>
                    <input
                      type="text"
                      value={featuresTitle}
                      onChange={(e) => setFeaturesTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Features Description</label>
                    <input
                      type="text"
                      value={featuresSubtitle}
                      onChange={(e) => setFeaturesSubtitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="bg-neutral-900 p-3 rounded-lg border border-neutral-850 space-y-2">
                      <p className="text-[9px] font-bold text-[#C9A84C] uppercase">Card #{idx + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Feature Title"
                          value={feat.title}
                          onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr"
                        />
                        <input
                          type="text"
                          placeholder="Image Path (e.g. /images/eco.jpg)"
                          value={feat.image}
                          onChange={(e) => handleFeatureChange(idx, "image", e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr font-mono"
                        />
                      </div>
                      <textarea
                        rows={1}
                        placeholder="Feature Description"
                        value={feat.description}
                        onChange={(e) => handleFeatureChange(idx, "description", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-maroonClr"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Block B: FAQs accordion */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                  <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" /> 3. Section 8: FAQ Accordion items
                  </h3>
                  <button
                    onClick={handleAddFaq}
                    className="text-[9px] font-bold text-white hover:text-goldClr uppercase tracking-wider flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Q&A
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">FAQ Heading</label>
                    <input
                      type="text"
                      value={faqTitle}
                      onChange={(e) => setFaqTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">FAQ Cover Image Path</label>
                    <input
                      type="text"
                      value={faqImage}
                      onChange={(e) => setFaqImage(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-neutral-900 p-3 rounded-lg border border-neutral-850 space-y-2 relative">
                      <button
                        onClick={() => handleRemoveFaq(idx)}
                        className="absolute right-2 top-2 text-neutral-500 hover:text-red-400"
                        title="Remove Accordion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-[9px] font-bold text-neutral-500 uppercase">Q&A #{idx + 1}</p>
                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                        className="w-[90%] bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-maroonClr font-semibold"
                      />
                      <textarea
                        rows={2}
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-maroonClr leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveHomepage}
              disabled={loading}
              className="bg-maroonClr hover:bg-[#A30C4D] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-maroonClr/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving homepage..." : "Save Homepage Layout"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
