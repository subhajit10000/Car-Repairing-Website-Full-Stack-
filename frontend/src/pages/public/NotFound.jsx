
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    CarFront,
    Home,
    Wrench,
    Search,
} from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">

        
     
            {/* Main Content */}
            <div className="relative z-10 w-full max-w-3xl text-center">



                {/* 404 */}
                <div className="relative">

                    <h1 className="select-none text-[120px] font-black leading-none tracking-tighter text-zinc-800 sm:text-[180px] lg:text-[240px]">
                        404
                    </h1>

  

                </div>

                {/* Heading */}
                <div className="-mt-4 sm:-mt-8">

        

                    <h2 className="text-3xl pt-10 font-bold tracking-tight sm:text-4xl">
                        Looks like you've taken a{" "}
                        <span className="text-yellow-500">
                            wrong turn.
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
                        The page you're looking for doesn't exist, may have been moved,
                        or the URL might be incorrect. Let's get you back on the road.
                    </p>

                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to="/" onClick={() => window.scroll(0,0)}

                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3.5 font-semibold text-zinc-950 shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-400"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3.5 font-semibold text-white transition hover:border-yellow-500 hover:text-yellow-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>

                </div>

                {/* Bottom Message */}
                <div className="mt-12 flex items-center justify-center gap-2 text-xs text-zinc-600">

                    <span className="h-px w-10 bg-zinc-800" />

                    <CarFront className="h-4 w-4 text-yellow-500/60" />

                    <span>
                        Reliable service. Better driving experience.
                    </span>

                    <span className="h-px w-10 bg-zinc-800" />

                </div>

            </div>
        </div>
    );
};

export default NotFound;
