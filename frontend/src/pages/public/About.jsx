
import about from "../../assets/about.jpg";
import workshop2 from "../../assets/workshop2.png";

import {
  FaBullseye,
  FaLightbulb,
  FaCar,
  FaTools,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-zinc-900 text-white">

   
{/* =====================================================
    HERO / BANNER
===================================================== */}
<section className="relative isolate h-130 overflow-hidden sm:h-140 lg:h-150">

  {/* Banner Image */}
  <img
    src={about}
    alt="Car Repair Workshop"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />

  {/* Light overlay */}
  <div className="absolute inset-0 bg-zinc-950/20" />

  {/* Subtle gradient for text readability */}
  <div className="absolute inset-0 bg-linear-to-r from-zinc-950/45 via-zinc-950/20 to-transparent" />

  {/* Very subtle bottom fade */}
  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-zinc-900/70 to-transparent" />

  {/* Small yellow glow */}
  <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />

  {/* Hero Content */}
  <div className="relative z-10 flex h-full items-center justify-center px-5 text-center sm:px-8">

    <div className="max-w-4xl">

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 mt-6 rounded-full border border-yellow-500/40 bg-zinc-950/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500 backdrop-blur-sm">
        <FaTools />
        Trusted Auto Care
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
        About
        <span className="block text-yellow-500">
          Our Workshop
        </span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-white drop-shadow-md sm:text-base sm:leading-8 md:text-lg">
        Professional car servicing, repairs, diagnostics, and
        maintenance delivered by experienced technicians using
        modern equipment.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

        <NavLink
          to="/service"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20"
        >
          Explore Services
          <FaArrowRight className="text-xs" />
        </NavLink>

        <NavLink
          to="/workshop"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center justify-center rounded-xl border border-white/50 bg-zinc-950/30 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-yellow-500 hover:text-yellow-500"
        >
          Find a Workshop
        </NavLink>

      </div>
    </div>
  </div>
</section>



      {/* =====================================================
          ABOUT WORKSHOP
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ================= IMAGE ================= */}
          <div className="relative">

            {/* Glow */}
            <div className="absolute -inset-3 rounded-4xl bg-yellow-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 shadow-2xl">

              <img
                src={workshop2}
                alt="Our Car Workshop"
                className="h-100 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-125 lg:h-140"
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent" />

              {/* Floating card */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-zinc-950/90 p-5 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-xl text-zinc-950">
                    <FaTools />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Professional Auto Service
                    </h3>

                    <p className="mt-1 text-sm text-zinc-400">
                      Quality repairs you can trust
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>


          {/* ================= CONTENT ================= */}
          <div>

            <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500">
              <span className="h-1.5 w-8 rounded-full bg-yellow-500" />
              Who We Are
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Keeping Your Car
              <span className="block text-yellow-500">
                Safe & Reliable
              </span>
            </h2>

            <p className="mt-6 leading-8 text-zinc-400">
              We are a professional automobile repair and servicing
              workshop dedicated to keeping your vehicle in excellent
              condition. From regular maintenance to complex repairs,
              our skilled technicians use modern tools and proven
              techniques to deliver dependable results.
            </p>

            <p className="mt-4 leading-8 text-zinc-400">
              Our goal is simple — provide transparent pricing, quality
              workmanship, genuine parts, and a hassle-free experience
              for every customer.
            </p>


            {/* Mission & Vision */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">

              {/* Mission */}
              <div className="group rounded-2xl border border-yellow-500/20 bg-yellow-500 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/10">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-xl text-yellow-500">
                  <FaBullseye />
                </div>

                <h3 className="text-xl font-bold text-zinc-950">
                  Our Mission
                </h3>

                <p className="mt-3 text-sm font-medium leading-7 text-zinc-800">
                  To provide reliable, affordable, and professional
                  vehicle repair services while putting customer
                  safety first.
                </p>

              </div>


              {/* Vision */}
              <div className="group rounded-2xl border border-zinc-700 bg-zinc-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/30">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-xl text-zinc-950">
                  <FaLightbulb />
                </div>

                <h3 className="text-xl font-bold">
                  Our Vision
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  To become a trusted destination for modern,
                  transparent, and technology-driven automobile care.
                </p>

              </div>

            </div>
          </div>
        </div>


        {/* =====================================================
            WHY CHOOSE US
        ===================================================== */}
        <div className="mt-20 grid gap-6 lg:grid-cols-2">

          {/* Why Us */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 p-8 shadow-xl sm:p-10">

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="relative">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-2xl text-zinc-950">
                <FaShieldAlt />
              </div>

              <h2 className="text-3xl font-black">
                Why Choose Us?
              </h2>

              <p className="mt-5 leading-8 text-zinc-400">
                We combine experienced technicians, modern diagnostic
                equipment, quality spare parts, transparent pricing,
                and customer-focused service to give your vehicle the
                care it deserves.
              </p>

              <div className="mt-7 space-y-4">

                {[
                  "Experienced technicians",
                  "Transparent pricing",
                  "Quality spare parts",
                  "Modern diagnostic equipment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <FaCheckCircle className="shrink-0 text-yellow-500" />
                    {item}
                  </div>
                ))}

              </div>

              <NavLink
                to="/service"
                onClick={() => window.scrollTo(0, 0)}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-zinc-950 transition hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
              >
                Explore Services
                <FaArrowRight className="text-xs" />
              </NavLink>

            </div>
          </div>


          {/* Stats */}
          <div className="relative overflow-hidden rounded-3xl bg-yellow-500 p-8 text-zinc-950 shadow-xl sm:p-10">

            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />

            <div className="relative">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-2xl text-yellow-500">
                <FaCar />
              </div>

              <h2 className="text-3xl font-black">
                Your Car Is In Safe Hands
              </h2>

              <p className="mt-5 leading-8 text-zinc-800">
                From routine servicing to major repairs, we make
                vehicle maintenance simple, transparent, and
                stress-free.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">

                <div>
                  <h3 className="text-3xl font-black sm:text-4xl">
                    10K+
                  </h3>
                  <p className="mt-1 text-sm font-bold">
                    Cars Serviced
                  </p>
                </div>

                <div>
                  <h3 className="text-3xl font-black sm:text-4xl">
                    15+
                  </h3>
                  <p className="mt-1 text-sm font-bold">
                    Expert Technicians
                  </p>
                </div>

                <div>
                  <h3 className="text-3xl font-black sm:text-4xl">
                    4.8★
                  </h3>
                  <p className="mt-1 text-sm font-bold">
                    Customer Rating
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto mb-12 max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-500">
              Our Commitment
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">
              Better Care For Your Car
            </h2>

            <p className="mt-4 leading-7 text-zinc-500">
              We focus on quality, transparency, and customer
              satisfaction at every stage of your vehicle's service.
            </p>

          </div>


          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: FaTools,
                title: "Expert Repairs",
                description:
                  "Skilled technicians handle everything from minor repairs to complex mechanical problems.",
              },
              {
                icon: FaShieldAlt,
                title: "Quality Parts",
                description:
                  "We use reliable and quality components to ensure long-lasting vehicle performance.",
              },
              {
                icon: FaClock,
                title: "On-Time Service",
                description:
                  "We value your time and aim to complete every service as efficiently as possible.",
              },
              {
                icon: FaCheckCircle,
                title: "Customer Satisfaction",
                description:
                  "Your satisfaction is our priority, from appointment booking to vehicle delivery.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/5"
                >

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-2xl text-zinc-950 transition-transform duration-300 group-hover:scale-110">
                    <Icon />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-zinc-500">
                    {feature.description}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>


      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="relative overflow-hidden bg-yellow-500 py-16 sm:py-20">

        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-yellow-500">
            <FaCar />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Give Your Car The Care It Deserves
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-800 sm:text-base">
            Book your next service or repair appointment with our
            professional workshop today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <NavLink
              to="/service"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Book Appointment
              <FaArrowRight className="text-xs" />
            </NavLink>

            <NavLink
              to="/workshop"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center justify-center rounded-xl border-2 border-zinc-950 px-7 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
            >
              Find Workshop
            </NavLink>

          </div>

        </div>
      </section>

    </div>
  );
};

export default About;
