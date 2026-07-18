import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/lib/api";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ComparisonSection from "@/components/ComparisonSection";
import Footer from "@/components/Footer";

export default function ComparePage() {
  const [category, setCategory] = useState("health");
  const [quoteInputs, setQuoteInputs] = useState({
    age: 32,
    coverage_amount: 100000,
    smoker: false,
    family_size: 1,
    gender: "other",
    term_years: 20,
  });
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQuoted, setHasQuoted] = useState(false);

  // Load default providers on mount / category change
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/providers/${category}`)
      .then((res) => {
        setQuotes(res.data);
      })
      .catch(() => toast.error("Failed to load providers"))
      .finally(() => setLoading(false));
  }, [category]);

  // Adjust defaults per category
  useEffect(() => {
    setQuoteInputs((prev) => ({
      ...prev,
      coverage_amount: category === "life" ? 500000 : 100000,
    }));
  }, [category]);

  const handleGetQuote = async () => {
    setLoading(true);
    try {
      const payload = {
        category,
        ...quoteInputs,
        coverage_amount: Number(quoteInputs.coverage_amount),
        age: Number(quoteInputs.age),
        family_size: Number(quoteInputs.family_size),
        term_years: Number(quoteInputs.term_years),
      };
      const { data } = await axios.post(`${API}/quote`, payload);
      setQuotes(data.quotes);
      setHasQuoted(true);
      toast.success(`Found ${data.quotes.length} personalized quotes`);
      setTimeout(() => {
        document
          .getElementById("comparison-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      toast.error("Could not fetch quotes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Navbar />
      <HeroSection
        category={category}
        setCategory={setCategory}
        quoteInputs={quoteInputs}
        setQuoteInputs={setQuoteInputs}
        onGetQuote={handleGetQuote}
        loading={loading}
      />
      <ComparisonSection
        category={category}
        quotes={quotes}
        loading={loading}
        hasQuoted={hasQuoted}
        quoteInputs={quoteInputs}
      />
      <Footer />
    </div>
  );
}
