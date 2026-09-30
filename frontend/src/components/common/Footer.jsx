
import React from "react";
import { Link } from "react-router-dom";

import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

import { CarFront } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-900 border-t border-zinc-800 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= NEWSLETTER ================= */}

        <div className="py-12 md:py-14 border-b border-zinc-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />

                <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                  Stay Updated
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Stay connected with us
              </h2>

              <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
                Subscribe to our newsletter and get the latest updates,
                automotive news, service tips, and exclusive offers.
              </p>
            </div>

            {/* Newsletter Form */}

            <form className="w-full lg:max-w-md">
              <div
                className="
                  flex
                  items-center
                  p-1.5
                  rounded-xl
                  bg-zinc-800
                  border
                  border-zinc-700
                  focus-within:border-yellow-500/50
                  focus-within:ring-1
                  focus-within:ring-yellow-500/20
                  transition-all
                "
              >
                <FiMail className="w-5 h-5 ml-3 text-zinc-500 shrink-0" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="
                    flex-1
                    min-w-0
                    bg-transparent
                    px-3
                    py-2.5
                    text-white
                    text-sm
                    placeholder:text-zinc-500
                    outline-none
                  "
                />

                <button
                  type="submit"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-lg
                    bg-yellow-500
                    hover:bg-yellow-400
                    text-black
                    text-sm
                    font-bold
                    transition-all
                    duration-300
                    shrink-0
                  "
                >
                  <span className="hidden sm:inline">
                    Subscribe
                  </span>

                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= MAIN FOOTER ================= */}

        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ================= BRAND ================= */}

          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 group"
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-yellow-500
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-yellow-500/10
                  group-hover:scale-105
                  group-hover:rotate-1
                  transition-all
                  duration-300
                "
              >
                <CarFront className="w-6 h-6 text-black" />
              </div>

              <span className="text-xl font-black text-white">
                Car Detailing
              </span>
            </Link>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              "The cars we drive say a lot about us."
              <span className="block text-zinc-500 mt-1">
                — Alexandra Paul
              </span>
            </p>

            {/* Social Icons */}

            <div className="flex items-center gap-3 mt-6">

              <a
                href="#"
                aria-label="GitHub"
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-zinc-400
                  hover:text-yellow-500
                  hover:border-yellow-500/40
                  hover:bg-yellow-500/10
                  transition-all
                  duration-300
                "
              >
                <FaGithub className="w-5 h-5" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-zinc-400
                  hover:text-yellow-500
                  hover:border-yellow-500/40
                  hover:bg-yellow-500/10
                  transition-all
                  duration-300
                "
              >
                <FaTwitter className="w-5 h-5" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-zinc-400
                  hover:text-yellow-500
                  hover:border-yellow-500/40
                  hover:bg-yellow-500/10
                  transition-all
                  duration-300
                "
              >
                <FaInstagram className="w-5 h-5" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-zinc-400
                  hover:text-yellow-500
                  hover:border-yellow-500/40
                  hover:bg-yellow-500/10
                  transition-all
                  duration-300
                "
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* ================= COMPANY ================= */}

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Company
            </h3>

            <div className="w-8 h-0.5 bg-yellow-500 mt-3 mb-5 rounded-full" />

            <ul className="space-y-3">
              {[
                ["/about", "About Us"],
                ["/service", "Services"],
                ["/contact", "Contact"],
                ["/careers", "Careers"],
              ].map(([path, label]) => (
                <li key={path}>
                  <Link
                    to={path} onClick={()=>{window.scroll(0,0)}}
                    className="
                      text-sm
                      text-zinc-400
                      hover:text-yellow-500
                      transition-colors
                      duration-300
                    "
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= RESOURCES ================= */}

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Resources
            </h3>

            <div className="w-8 h-0.5 bg-yellow-500 mt-3 mb-5 rounded-full" />

            <ul className="space-y-3">
              {[
                ["/blog", "Blog"],
                ["/faq", "FAQ"],
                ["/help", "Help Center"],
                ["/privacy", "Privacy Policy"],
              ].map(([path, label]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="
                      text-sm
                      text-zinc-400
                      hover:text-yellow-500
                      transition-colors
                      duration-300
                    "
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= CONTACT ================= */}

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact
            </h3>

            <div className="w-8 h-0.5 bg-yellow-500 mt-3 mb-5 rounded-full" />

            <ul className="space-y-5">

              {/* Email */}

              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <FiMail className="w-4 h-4 text-yellow-500" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    Email
                  </p>

                  <a
                    href="mailto:car@detailing.com"
                    className="text-sm text-zinc-400 hover:text-yellow-500 transition"
                  >
                    car@detailing.com
                  </a>
                </div>
              </li>

              {/* Phone */}

              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <FiPhone className="w-4 h-4 text-yellow-500" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    Phone
                  </p>

                  <a
                    href="tel:+919876543210"
                    className="text-sm text-zinc-400 hover:text-yellow-500 transition"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </li>

              {/* Location */}

              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <FiMapPin className="w-4 h-4 text-yellow-500" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    Location
                  </p>

                  <span className="text-sm text-zinc-400 leading-6">
                    Kolkata, West Bengal,
                    <br />
                    India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM FOOTER ================= */}

        <div className="py-6 border-t border-zinc-800">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-sm text-zinc-500 text-center sm:text-left">
              © {currentYear}{" "}
              <span className="text-zinc-400">
                Car Detailing
              </span>
              . All rights reserved.
            </p>

            <div className="flex items-center gap-5">

              <Link
                to="/terms"
                className="text-sm text-zinc-500 hover:text-yellow-500 transition"
              >
                Terms
              </Link>

              <Link
                to="/privacy"
                className="text-sm text-zinc-500 hover:text-yellow-500 transition"
              >
                Privacy
              </Link>

              <Link
                to="/cookies"
                className="text-sm text-zinc-500 hover:text-yellow-500 transition"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

