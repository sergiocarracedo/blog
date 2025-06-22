import { SITE_TITLE } from '@/consts';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import HeaderLink from './HeaderLink.astro';

export default function MenuOverlay({ menu }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label={open ? 'Close menu': 'Open menu'}
        className="flex flex-col justify-center items-center w-10 h-10 group z-50"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="block w-6 h-0.5 bg-primary mb-1 transition-all duration-300 group-hover:bg-black" style={{ transform: open ? 'rotate(45deg) translateY(7px)' : '' }}></span>
        <span className="block w-6 h-0.5 bg-primary mb-1 transition-all duration-300 group-hover:bg-black" style={{ opacity: open ? 0 : 1 }}></span>
        <span className="block w-6 h-0.5 bg-primary transition-all duration-300 group-hover:bg-black" style={{ transform: open ? 'rotate(-45deg) translateY(-7px)' : '' }}></span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center w-full h-full"
          >
            <h2 className="mb-8 text-2xl font-bold flex flex-cols items-center justify-center flex-wrap gap-2">
                <img
                src="/i/sergiocarracedo.jpg"
                alt="Sergio Carracedo"
                width={50}
                height={50}
                class="inline-block rounded-full border-solid border-primary border-4"
                />  
                {SITE_TITLE}
            </h2>
            <nav className="flex flex-col gap-6 text-xl">
              {menu.map((item) => (
                <HeaderLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >{item.label}</HeaderLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
