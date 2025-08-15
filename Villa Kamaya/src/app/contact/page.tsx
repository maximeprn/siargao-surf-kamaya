'use client';

import { useEffect, useRef, useState } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollReveal(heroRef.current);
    scrollReveal(formRef.current, { x: 60, opacity: 0, duration: 1.2 });
    scrollReveal(contactInfoRef.current, { x: -60, opacity: 0, duration: 1.2 });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This will later integrate with Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      value: 'info@villakamaya.com',
      description: 'Best for detailed inquiries'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      value: '+63 xxx xxx xxxx',
      description: 'Call for immediate assistance'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'WhatsApp',
      value: '+63 xxx xxx xxxx',
      description: 'Quick responses via WhatsApp'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Address',
      value: 'General Luna, Siargao Island',
      description: 'Surigao del Norte, Philippines'
    }
  ];

  const faqs = [
    {
      question: 'What is the check-in and check-out time?',
      answer: 'Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request.'
    },
    {
      question: 'Is airport transfer included?',
      answer: 'We can arrange airport transfers for an additional fee. Please let us know your flight details when booking.'
    },
    {
      question: 'What amenities are included?',
      answer: 'The villa includes WiFi, air conditioning, fully equipped kitchen, pool, and complimentary toiletries. View our amenities page for a complete list.'
    },
    {
      question: 'Is there a minimum stay requirement?',
      answer: 'We have a 3-night minimum stay during peak season and 2-night minimum during regular season.'
    }
  ];

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-50 to-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Have questions about Villa Kamaya? We're here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div ref={contactInfoRef} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  Contact Information
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Choose the best way to reach us. We're always happy to answer your questions 
                  about Villa Kamaya, Siargao activities, or help with your booking.
                </p>
              </div>

              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{method.title}</h3>
                      <p className="text-blue-600 font-medium mb-1">{method.value}</p>
                      <p className="text-sm text-slate-600">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="pt-8 border-t border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors">
                    <span className="text-sm font-bold">IG</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors">
                    <span className="text-sm font-bold">FB</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div ref={formRef} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Booking Question">Booking Question</option>
                      <option value="Existing Reservation">Existing Reservation</option>
                      <option value="Special Request">Special Request</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Tell us about your inquiry..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Find quick answers to common questions about Villa Kamaya.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">Still have questions?</p>
            <Button>Contact Us Directly</Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;