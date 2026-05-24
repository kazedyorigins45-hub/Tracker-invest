"use client";

import Image from 'next/image';
import logo from '../c74b7bdd-4a0c-47b1-ab33-364b0d772f80.png';

export default function LogoMark() {
  return (
    <div className="logo-mark" aria-label="Tracker-invest logo">
      <Image src={logo} alt="Tracker-invest" priority className="logo-mark-img" />
    </div>
  );
}
