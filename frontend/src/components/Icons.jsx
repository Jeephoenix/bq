const defaultProps = { width: 18, height: 18, stroke: "currentColor", fill: "none", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };

const Icon = ({ children, size = 18, className = "", style = {}, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    {...rest}
  >
    {children}
  </svg>
);

export const HomeIcon       = (p) => <Icon {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></Icon>;
export const MapIcon        = (p) => <Icon {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Icon>;
export const ShieldIcon     = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
export const TrophyIcon     = (p) => <Icon {...p}><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 000 4c0 2.5 2 4.5 5 5"/><path d="M17 4h3a2 2 0 010 4c0 2.5-2 4.5-5 5"/><rect x="7" y="2" width="10" height="9" rx="2"/></Icon>;
export const SearchIcon     = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
export const SunIcon        = (p) => <Icon {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
export const MoonIcon       = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></Icon>;
export const WalletIcon     = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" stroke="none"/><path d="M2 9h20"/></Icon>;
export const CheckIcon      = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
export const CheckCircleIcon= (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
export const FireIcon       = (p) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></Icon>;
export const CalendarIcon   = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>;
export const ZapIcon        = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
export const StarIcon       = (p) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
export const UsersIcon      = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Icon>;
export const LinkIcon       = (p) => <Icon {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>;
export const RefreshIcon    = (p) => <Icon {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></Icon>;
export const LogOutIcon     = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
export const AlertIcon      = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
export const LockIcon       = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Icon>;
export const ChevronDownIcon= (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
export const ChevronUpIcon  = (p) => <Icon {...p}><polyline points="18 15 12 9 6 15"/></Icon>;
export const DiamondIcon    = (p) => <Icon {...p}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></Icon>;
export const NetworkIcon    = (p) => <Icon {...p}><circle cx="12" cy="12" r="2"/><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"/><path d="M2 12h20M12 2c-2.76 4-4 7.5-4 10s1.24 6 4 10M12 2c2.76 4 4 7.5 4 10s-1.24 6-4 10"/></Icon>;
export const SwapIcon       = (p) => <Icon {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></Icon>;
export const BridgeIcon     = (p) => <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Icon>;
export const CodeIcon       = (p) => <Icon {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>;
export const XIcon          = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
export const InfoIcon       = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>;
export const ArrowRightIcon = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>;
export const SwordIcon      = (p) => <Icon {...p}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></Icon>;
export const SkullIcon      = (p) => <Icon {...p}><circle cx="12" cy="11" r="8"/><path d="M12 3a8 8 0 00-8 8c0 3 1.5 5.5 4 7v2h8v-2c2.5-1.5 4-4 4-7a8 8 0 00-8-8z"/><line x1="9" y1="17" x2="9" y2="19"/><line x1="15" y1="17" x2="15" y2="19"/><circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none"/></Icon>;
export const TargetIcon     = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
export const PersonIcon     = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
export const SeedlingIcon   = (p) => <Icon {...p}><path d="M12 22V9"/><path d="M12 9C12 9 7 9 4 5c3 0 8 4 8 4z"/><path d="M12 9c0 0 5 0 8-4-3 0-8 4-8 4z"/><path d="M4 22h16"/></Icon>;
export const HammerIcon     = (p) => <Icon {...p}><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 010-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.35 12.35L22 10.7a2.12 2.12 0 000-3L18.3 3.7a2.12 2.12 0 00-3 0L13.65 5.35"/></Icon>;
export const SunriseIcon    = (p) => <Icon {...p}><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></Icon>;
export const IdCardIcon     = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 10a2 2 0 100-4 2 2 0 000 4z"/><path d="M5 18c0-2.2 1.3-4 3-4h8"/><line x1="13" y1="9" x2="19" y2="9"/><line x1="13" y1="13" x2="17" y2="13"/></Icon>;
export const MedalIcon      = (p) => <Icon {...p}><circle cx="12" cy="15" r="6"/><path d="M8.56 2.9L7 4l1 4h8l1-4-1.56-1.1a6 6 0 00-6.88 0z"/></Icon>;
export const BarChartIcon   = (p) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Icon>;
export const CoinIcon       = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-4-6h8"/><path d="M9.5 9.5c.5-1.5 2-2 3-1.5s2 1.5 1.5 3-2.5 2-3 3.5"/></Icon>;
export const ClockIcon      = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
export const ListIcon       = (p) => <Icon {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Icon>;

export const TrendingUpIcon  = (p) => <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>;
export const GiftIcon        = (p) => <Icon {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></Icon>;
export const ScanIcon        = (p) => <Icon {...p}><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></Icon>;
export const LayersIcon      = (p) => <Icon {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Icon>;
export const WrenchIcon      = (p) => <Icon {...p}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></Icon>;
export const ShieldCheckIcon = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></Icon>;
export const AlertTriIcon    = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;

export const EthereumIcon = ({ size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style}>
    <polygon points="16,2 6,17 16,13"    fill="#8A92B2"/>
    <polygon points="16,2 26,17 16,13"   fill="#62688F"/>
    <polygon points="16,13 6,17 16,20"   fill="#62688F"/>
    <polygon points="16,13 26,17 16,20"  fill="#454A75"/>
    <polygon points="16,20 6,17 16,30"   fill="#8A92B2"/>
    <polygon points="16,20 26,17 16,30"  fill="#62688F"/>
  </svg>
);
