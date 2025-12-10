"use client";

import { Fragment, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import NavLinkMobile from "./NavLinkMobile";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-800">
      {/* DESKTOP NAV */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center">
            {/* LOGO */}
            <div className="shrink-0">
              <Link href="/">
                <img
                  className="size-10"
                  src="/148980.svg"
                  alt="EduApp"
                />
              </Link>
            </div>

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/dashboard/activities">Mis actividades</NavLink>
                <NavLink href="/dashboard/activities/new">Crear actividad</NavLink>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE DESKTOP */}
          <div className="hidden md:flex items-center space-x-3">

            {!user ? (
              <>
                <NavLink href="/login">Iniciar sesión</NavLink>
                <NavLink href="/register">Registrarse</NavLink>
              </>
            ) : (
              <>
                {/* Notifications */}
                {/*
                <button className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="size-6" />
                </button>
                */}

                {/* USER DROPDOWN */}
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="rounded-md px-3 text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2 focus:outline-none">

                    {/* Foto SOLO si existe */}
                    {user?.photoURL && (
                      <img
                        src={user.photoURL}
                        className="size-8 rounded-full outline -outline-offset-1 outline-white/10"
                        alt="Foto de perfil"
                      />

                    )}

                    {/* Texto: nombre o email */}
                    <span className="text-sm font-medium text-white">
                      {user?.displayName || user?.email}
                    </span>

                    {/* Flecha del desplegable */}
                    <ChevronDownIcon className="w-4 h-4 text-gray-300" />

                  </MenuButton>


                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-1 outline-black/5">
                      {/*
                      <MenuItem>
                        <a
                          className="cursor-pointer block px-4 py-2 text-sm text-gray-700 data-[active]:bg-gray-100"
                        >
                          Your profile
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          className="cursor-pointer block px-4 py-2 text-sm text-gray-700 data-[active]:bg-gray-100"
                        >
                          Settings
                        </a>
                      </MenuItem> */}
                      <MenuItem>
                        <a
                          onClick={handleLogout}
                          className="cursor-pointer block px-4 py-2 text-sm text-gray-700 data-[active]:bg-gray-100"
                        >
                          Sign out
                        </a>
                      </MenuItem>
                    </MenuItems>
                  </Transition>
                </Menu>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-white hover:bg-white/5"
            >
              {!mobileOpen ? (
                <Bars3Icon className="size-6" />
              ) : (
                <XMarkIcon className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1"
          onClick={(e) => {
            const target = e.target as HTMLElement;

            // Si el usuario hace clic en un <a> (Link), cerrar menú
            if (target.closest("a")) {
              setMobileOpen(false);
            }
          }}>
          <NavLinkMobile href="/dashboard">Dashboard</NavLinkMobile>
          <NavLinkMobile href="/dashboard/activities">Mis actividades</NavLinkMobile>
          <NavLinkMobile href="/dashboard/activities/new">Crear actividad</NavLinkMobile>


          {/* Mobile user section */}
          <div className="border-t border-white/10 pt-4 pb-3">
            <div className="flex items-center px-5">
              {user?.photoURL && (
                <img
                  className="size-10 rounded-full outline outline-white/10 -outline-offset-1"
                  src={user.photoURL}
                />
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.displayName || ""}</div>
                <div className="text-sm font-medium text-gray-400">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 px-2">
              <a onClick={handleLogout} className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white">
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
