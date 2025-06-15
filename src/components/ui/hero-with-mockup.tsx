import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroWithMockupProps {
  title: string;
  description: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
}

export const HeroWithMockup: React.FC<HeroWithMockupProps> = ({
  title,
  description,
  primaryCta,
  secondaryCta
}) => {
  const handleCtaClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-center">
          {/* Hero content */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {title.split(' ').map((word, index) => {
              if (word === 'Customer' || word === 'Call') {
                return (
                  <span key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => handleCtaClick(primaryCta.href)}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>{primaryCta.text}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {secondaryCta && (
              <button
                onClick={() => handleCtaClick(secondaryCta.href)}
                className="group bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 flex items-center space-x-2"
              >
                {secondaryCta.icon}
                <span>{secondaryCta.text}</span>
              </button>
            )}
          </div>
          
          {/* Mockup placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center">
                  <div className="bg-white rounded px-3 py-1 text-sm text-gray-600 inline-block">
                    dashboard.voiceagent.ai
                  </div>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Live Dashboard Preview Below</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};