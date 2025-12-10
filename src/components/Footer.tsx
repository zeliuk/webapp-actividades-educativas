export default function Footer() {
    return (
        <footer className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

                {/* SECCIÓN SUPERIOR */}
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">

                    {/* BLOQUE DE LISTAS */}
                    <div className="grid grid-cols-2 gap-8 xl:col-span-2">

                        <div className="grid grid-cols-2 gap-8">
                            {/* Solutions 
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Solutions</h3>
                                <ul className="mt-4 space-y-2 text-sm" role="list">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Marketing</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Analytics</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Automation</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Commerce</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Insights</a></li>
                                </ul>
                            </div> */}

                            {/* Support 
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Support</h3>
                                <ul className="mt-4 space-y-2 text-sm" role="list">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Submit ticket</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Guides</a></li>
                                </ul>
                            </div> */}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Company 
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                                <ul className="mt-4 space-y-2 text-sm" role="list">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Jobs</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Press</a></li>
                                </ul>
                            </div> */}

                            {/* Legal 
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
                                <ul className="mt-4 space-y-2 text-sm" role="list">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of service</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy policy</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">License</a></li>
                                </ul>
                            </div> */}
                        </div>

                    </div>

                    {/* NEWSLETTER 
                    <div className="mt-10 xl:mt-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Subscribe to our newsletter
                        </h3>
                        <p className="mt-4 text-sm text-gray-600">
                            The latest news, articles, and resources, sent to your inbox weekly.
                        </p>

                        <form className="mt-6 flex max-w-md gap-x-2">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                type="email"
                                required
                                placeholder="Enter your email"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div> */}

                </div>

                {/* SEPARADOR / PARTE INFERIOR */}
                <div className="mt-12 border-t pt-8 flex flex-col md:flex-row md:items-center md:justify-between">

                    <p className="mt-6 text-sm text-gray-600 md:mt-0">
                        © {new Date().getFullYear()} EduApp - Todos los derechos reservados.
                    </p>

                    {/* Redes 
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Facebook</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                        </a>

                        <a href="#" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.315 2c2.43 0..." />
                            </svg>
                        </a>

                        <a href="#" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">X</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.6823 10.6218..." />
                            </svg>
                        </a>

                        <a href="#" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">GitHub</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2..." />
                            </svg>
                        </a>

                        <a href="#" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">YouTube</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.812 5.418..." />
                            </svg>
                        </a>
                    </div> */}
                </div>

            </div>
        </footer>
    );
}
