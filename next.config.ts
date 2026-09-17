import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'accès au serveur de dev depuis l'IP locale (ex. test sur mobile
  // via le réseau Wi-Fi), sans quoi Next.js bloque les assets de dev en
  // cross-origin et les composants clients (comme les listes déroulantes de
  // filtre) restent inertes bien que le HTML s'affiche normalement.
  allowedDevOrigins: ["192.168.1.10"],
};

export default nextConfig;
