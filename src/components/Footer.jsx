import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0A0A4D] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0A0A4D]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold">HealthRoute</span>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#case-studies" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Case studies
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#updates" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Updates
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Careers
                </a>
              </li>
              <li>
                <a href="#culture" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Culture
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#getting-started" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Getting started
                </a>
              </li>
              <li>
                <a href="#help-center" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Help center
                </a>
              </li>
              <li>
                <a href="#server-status" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Server status
                </a>
              </li>
              <li>
                <a href="#report-bug" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Report a bug
                </a>
              </li>
              <li>
                <a href="#chat-support" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Chat support
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow us</h3>
            <ul className="space-y-3">
              <li>
                <a href="#facebook" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="#twitter" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a href="#instagram" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="#linkedin" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="#youtube" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                  <Youtube className="w-5 h-5" />
                  <span>YouTube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HealthRoute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;