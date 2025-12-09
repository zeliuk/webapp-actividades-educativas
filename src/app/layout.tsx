import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TailwindElementsLoader from "@/components/TailwindElementsLoader";

export const metadata = {
  title: "Plataforma educativa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return ( 
    <html lang="es" className="h-full bg-gray-100">
      <body className="h-full">
        <TailwindElementsLoader />
        <div className="min-h-full">
          <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="size-8" />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      <a href="#" aria-current="page" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">Dashboard</a>
                      <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Team</a>
                      <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Projects</a>
                      <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Calendar</a>
                      <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Reports</a>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button type="button" className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                      <span className="absolute -inset-1.5"></span>
                      <span className="sr-only">View notifications</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6">
                        <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>

                    <el-dropdown class="relative ml-3">
                      <button className="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                        <span className="absolute -inset-1.5"></span>
                        <span className="sr-only">Open user menu</span>
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="size-8 rounded-full outline -outline-offset-1 outline-white/10" />
                      </button>

                      <el-menu anchor="bottom end" popover className="w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline-1 outline-black/5 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Your profile</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Settings</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Sign out</a>
                      </el-menu>
                    </el-dropdown>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">

                  <button type="button" command="--toggle" commandfor="mobile-menu" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                    <span className="absolute -inset-0.5"></span>
                    <span className="sr-only">Open main menu</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6 in-aria-expanded:hidden">
                      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6 not-in-aria-expanded:hidden">
                      <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <el-disclosure id="mobile-menu" hidden className="block md:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                <a href="#" aria-current="page" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white">Dashboard</a>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Team</a>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Projects</a>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Calendar</a>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Reports</a>
              </div>
              <div className="border-t border-white/10 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="size-10 rounded-full outline -outline-offset-1 outline-white/10" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base/5 font-medium text-white">Tom Cook</div>
                    <div className="text-sm font-medium text-gray-400">tom@example.com</div>
                  </div>
                  <button type="button" className="relative ml-auto shrink-0 rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">View notifications</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6">
                      <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white">Your profile</a>
                  <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white">Settings</a>
                  <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white">Sign out</a>
                </div>
              </div>
            </el-disclosure>
          </nav>

          <header className="relative bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          
          
              
            </div>
          </main>
        </div>
        <AuthProvider>

          <Header />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 mt-24 mb-20">
            {children}
          </main>

          <Footer />

        </AuthProvider>
      </body>
    </html>
  );
}