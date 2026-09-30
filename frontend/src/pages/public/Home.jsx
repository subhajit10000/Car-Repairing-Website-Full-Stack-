import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Gauge,
  Wrench,
  Settings2,
  Sparkles,
  Star,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import front from "../../assets/front.jpg";


export default function Home() {
  const [heroReady, setHeroReady] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(timer);
  }, []);


  const services = [
    {
      icon: Gauge,
      title: "Diagnostics & inspection",
      description:
        "Full computerized diagnostics before we touch a single bolt, so you know exactly what's needed.",
    },
    {
      icon: Wrench,
      title: "Routine maintenance",
      description:
        "Oil changes, brakes, tyres, and scheduled servicing — logged to your vehicle's history automatically.",
    },
    {
      icon: Settings2,
      title: "Engine & transmission",
      description:
        "Complex repairs handled by manufacturer-trained mechanics, with parts and labour under warranty.",
    },
    {
      icon: Sparkles,
      title: "Detailing & care",
      description:
        "Interior and exterior detailing that finishes the job properly, every time you visit.",
    },
  ];


  return (
    <>
      <div className="ac-page bg-zinc-900 text-white">
        <section className="relative h-168 w-full overflow-hidden">
          <img
            className="ac-hero-img h-full w-full object-cover opacity-100"
            src={front}
            alt="A car undergoing service at an AutoCare workshop"
          />

          <div className="absolute inset-0 bg-linear-to-r from-[#161515] to-[#111316]/20" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6">
              <div className="max-w-xl">
                {heroReady && (
                  <>
                    <h1 className="ac-display ac-reveal ac-reveal-1 text-5xl font-semibold leading-[1.05] text-[#F5F3EE] sm:text-6xl">
                      Precision care for every mile you drive
                    </h1>

                    <p className="ac-reveal ac-reveal-2 mt-6 max-w-md text-lg leading-relaxed text-[#C7CDD6]">
                      Book certified diagnostics, maintenance, and repair —
                      then watch your vehicle's status update in real time,
                      from drop-off to drive-away.
                    </p>

                    <div className="ac-reveal ac-reveal-3 mt-9 flex flex-wrap items-center gap-4">
                      <NavLink to="/service" onClick={() => window.scrollTo(0, 0)}>
                        <button className="group flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3.5 text-base font-semibold text-[#12151A] transition hover:bg-[#F2A33C]">
                          Book a service
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </NavLink>

                      <NavLink to="/about" onClick={() => window.scrollTo(0, 0)}
                        
                        className="text-base font-medium text-[#F5F3EE] underline decoration-[#3E5C76] decoration-2 underline-offset-4 transition hover:text-[#F2A33C]"
                      >
                        See how it works
                      </NavLink>
                    </div>

                    <div className="ac-reveal ac-reveal-4 mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-2.5 text-sm text-[#C7CDD6]">
                        <Star className="h-4 w-4 text-yellow-500" />
                        4.9 average rating
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-[#C7CDD6]">
                        <Users className="h-4 w-4 text-yellow-500" />
                        12,400+ vehicles serviced
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-[#C7CDD6]">
                        <ShieldCheck className="h-4 w-4 text-yellow-500" />
                        38 certified mechanics
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 bg-zinc-900 w-full">
          <div className="max-w-lg">
            <h2 className="ac-display text-3xl font-semibold text-white sm:text-4xl">
              Everything your vehicle needs, under one roof
            </h2>
            <p className="mt-4 text-slate-300 font-semibold">
              From a quick inspection to a full engine rebuild, every job runs
              through the same transparent process and the same trained team.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#E2DFD6] bg-[#E2DFD6] sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-[#b1ada2] p-7 transition hover:bg-yellow-400"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#3E5C76]/10 text-[#000000] transition group-hover:bg-[#E2812A]/10 group-hover:text-[#fd0101]">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-[#12151A]">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#000000]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
