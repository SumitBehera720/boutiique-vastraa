"use client";

import { useState } from "react";
import { Star, MessageSquare, HelpCircle, CheckCircle, User, Calendar } from "lucide-react";

interface Review {
  id: string;
  productHandle: string;
  author: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

interface QnAItem {
  id: string;
  productHandle: string;
  author: string;
  question: string;
  answer: string | null;
  approved: boolean;
  createdAt: string;
}

interface ProductReviewsQnAProps {
  productHandle: string;
  productId: string;
  initialReviews: Review[];
  initialQnas: QnAItem[];
}

export default function ProductReviewsQnA({
  productHandle,
  productId,
  initialReviews = [],
  initialQnas = [],
}: ProductReviewsQnAProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "qna">("reviews");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews.filter(r => r.productHandle === productHandle || r.productHandle === productId || (r as any).productId === productHandle || (r as any).productId === productId));
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Q&A state
  const [qnas, setQnas] = useState<QnAItem[]>(initialQnas.filter(q => q.productHandle === productHandle));
  const [qnaAuthor, setQnaAuthor] = useState("");
  const [qnaEmail, setQnaEmail] = useState("");
  const [qnaQuestion, setQnaQuestion] = useState("");
  const [isSubmittingQna, setIsSubmittingQna] = useState(false);
  const [qnaSuccess, setQnaSuccess] = useState(false);

  // Calculate rating stats
  const approvedReviews = reviews.filter(r => r.approved !== false);
  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productHandle,
          author: reviewAuthor,
          email: reviewEmail,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      
      const newReview = await res.json();
      
      // Update local state by adding the submitted review
      // Note: Approved is false initially, but we can display it with a "Pending Approval" tag for the submitting user
      setReviews([newReview, ...reviews]);
      
      setReviewSuccess(true);
      setReviewAuthor("");
      setReviewEmail("");
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleQnaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaAuthor.trim() || !qnaQuestion.trim()) return;
    setIsSubmittingQna(true);

    try {
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle,
          author: qnaAuthor,
          email: qnaEmail,
          question: qnaQuestion,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit question");

      const newQna = await res.json();
      setQnas([newQna, ...qnas]);

      setQnaSuccess(true);
      setQnaAuthor("");
      setQnaEmail("");
      setQnaQuestion("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting your question.");
    } finally {
      setIsSubmittingQna(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive 
            ? (reviewHoverRating !== null ? star <= reviewHoverRating : star <= reviewRating)
            : star <= rating;

          return (
            <Star
              key={star}
              className={`w-5 h-5 ${interactive ? "cursor-pointer transition-colors" : ""} ${
                isFilled ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }`}
              onMouseEnter={() => interactive && setReviewHoverRating(star)}
              onMouseLeave={() => interactive && setReviewHoverRating(null)}
              onClick={() => interactive && setReviewRating(star)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div id="reviews" className="w-full mt-12 bg-gray-50/50 border-t border-b border-gray-100 py-12 scroll-mt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 max-w-md mx-auto justify-center gap-6">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 px-4 font-kalnia font-medium text-base tracking-wide flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "reviews"
                ? "border-maroonClr text-maroonClr"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("qna")}
            className={`pb-4 px-4 font-kalnia font-medium text-base tracking-wide flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "qna"
                ? "border-maroonClr text-maroonClr"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Questions & Answers ({qnas.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "reviews" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviews Summary & Write Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit">
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">Customer Summary</h3>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-bold font-sans text-gray-900">{avgRating}</span>
                <div className="flex flex-col gap-1">
                  {renderStars(Math.round(parseFloat(avgRating)))}
                  <span className="text-sm text-gray-500">Based on {totalReviews} approved reviews</span>
                </div>
              </div>

              {reviewSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-lg text-center flex flex-col items-center gap-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                  <p className="font-semibold text-lg">Review Submitted!</p>
                  <p className="text-sm text-emerald-600">
                    Thank you! Your review has been recorded and will show on the store once approved.
                  </p>
                  <button
                    onClick={() => setReviewSuccess(false)}
                    className="mt-2 text-xs uppercase tracking-wider text-primary font-bold hover:underline"
                  >
                    Write another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  <h4 className="text-lg font-semibold text-gray-800">Write a Review</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Rating</label>
                    {renderStars(reviewRating, true)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. Aarav Patel"
                        className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email (Private) *</label>
                      <input
                        type="email"
                        required
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        placeholder="e.g. aarav@example.com"
                        className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Review *</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-maroonClr text-white py-3 rounded font-bold uppercase tracking-wider text-xs hover:bg-[#6A102A] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {reviews.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p>No reviews yet for this product.</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative transition-all ${
                      !review.approved ? "opacity-75 bg-amber-50/10 border-amber-100" : ""
                    }`}
                  >
                    {!review.approved && (
                      <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        Pending Approval
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {review.author}
                        </span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Ask Question Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit">
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">Have Questions?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Get answers from our product support team or details about customization/shipping.
              </p>

              {qnaSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-lg text-center flex flex-col items-center gap-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                  <p className="font-semibold text-lg">Question Submitted!</p>
                  <p className="text-sm text-emerald-600">
                    Thank you! We have received your query. A support representative will answer it shortly.
                  </p>
                  <button
                    onClick={() => setQnaSuccess(false)}
                    className="mt-2 text-xs uppercase tracking-wider text-primary font-bold hover:underline"
                  >
                    Ask another question
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQnaSubmit} className="flex flex-col gap-4">
                  <h4 className="text-lg font-semibold text-gray-800">Ask a Question</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={qnaAuthor}
                        onChange={(e) => setQnaAuthor(e.target.value)}
                        placeholder="e.g. Priya"
                        className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email (Private) *</label>
                      <input
                        type="email"
                        required
                        value={qnaEmail}
                        onChange={(e) => setQnaEmail(e.target.value)}
                        placeholder="e.g. priya@example.com"
                        className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Question *</label>
                    <textarea
                      required
                      rows={4}
                      value={qnaQuestion}
                      onChange={(e) => setQnaQuestion(e.target.value)}
                      placeholder="e.g. Can I order this saree with a customized stitched blouse?"
                      className="border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-maroonClr transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingQna}
                    className="w-full bg-maroonClr text-white py-3 rounded font-bold uppercase tracking-wider text-xs hover:bg-[#6A102A] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingQna ? "Submitting..." : "Submit Question"}
                  </button>
                </form>
              )}
            </div>

            {/* Q&A List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {qnas.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p>No questions asked yet for this product.</p>
                  <p className="text-sm text-gray-400 mt-1">If you have any doubts, ask us above!</p>
                </div>
              ) : (
                qnas.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 relative transition-all ${
                      !item.approved && !item.answer ? "opacity-75 bg-amber-50/10 border-amber-100" : ""
                    }`}
                  >
                    {!item.answer && (
                      <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        Awaiting Answer
                      </span>
                    )}

                    {/* Question */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-maroonClr font-bold uppercase tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Question
                        </span>
                        <span className="text-xs text-gray-400">
                          By {item.author} • {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="text-gray-800 font-semibold text-sm leading-relaxed">{item.question}</p>
                    </div>

                    {/* Answer (if available) */}
                    {item.answer ? (
                      <div className="border-t border-gray-100 pt-4 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Boutiique Vastraa Support
                        </span>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 pt-4 bg-gray-50/30 -mx-6 -mb-6 p-4 text-center rounded-b-xl">
                        <p className="text-xs text-gray-400 italic">This question hasn't been answered yet.</p>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
