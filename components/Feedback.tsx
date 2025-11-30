
import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "The process was so fast and easy! I got the funds I needed for my final project just in time. Truly a lifesaver for students.",
    author: "- Engineering Student, Sorsogon State University",
  },
  {
    quote: "I was hesitant at first, but Allowance Aid is legitimate. The terms are clear and the interest rates are very fair for a student loan.",
    author: "- Business Administration Student, Annunciation College of Sorsogon",
  },
  {
    quote: "Their customer service is amazing. They answered all my questions patiently. Highly recommended for any student in need of a little financial help.",
    author: "- IT Student, The Lewis College",
  },
  {
    quote: "Finally, a lending service that actually understands the needs of a college student. The weekly payments are manageable for my allowance.",
    author: "- Nursing Student, Sorsogon State University - Bulan Campus",
  },
];

const Feedback: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTestimonial((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsFading(false);
      }, 500); // Duration of the fade-out
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim() === '') return;
    setIsFeedbackSubmitted(true);
    setFeedbackText('');
    setTimeout(() => setIsFeedbackSubmitted(false), 4000); // Hide success message after 4 seconds
  };

  return (
    <section id="feedback" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-dark">What Our Clients Say</h2>
          <p className="text-gray-600 mt-2">Honest feedback from students we've helped.</p>
        </div>
        
        {/* Testimonials */}
        <div className="max-w-3xl mx-auto text-center h-48 flex items-center justify-center">
            <div className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-lg md:text-xl italic text-gray-700">"{testimonials[currentTestimonial].quote}"</p>
                <p className="mt-4 font-semibold text-brand-blue">{testimonials[currentTestimonial].author}</p>
            </div>
        </div>

        {/* Feedback Form */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-brand-blue-dark text-center mb-6">Leave Your Feedback</h3>
            {isFeedbackSubmitted ? (
               <div className="text-center p-4 bg-green-100 text-brand-green font-semibold rounded-md">
                    Thank you! Your feedback has been submitted.
                </div>
            ) : (
                <form onSubmit={handleFeedbackSubmit}>
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white"
                        placeholder="Share your experience with us..."
                        required
                    ></textarea>
                    <div className="text-center mt-4">
                        <button
                            type="submit"
                            className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-2 px-8 rounded-full transition duration-300"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;