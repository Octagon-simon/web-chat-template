interface IconProps {
  size?: number;
}

function svg(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export const IconPlus = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconPanel = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M9 4v16" />
  </svg>
);

export const IconMenu = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconSend = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)} strokeWidth={2}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const IconStop = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)} fill="currentColor" stroke="none">
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </svg>
);

export const IconCopy = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-6A3.5 3.5 0 0 0 3 6.5v6A2.5 2.5 0 0 0 5.5 15" />
  </svg>
);

export const IconCheck = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)} strokeWidth={2}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

export const IconReload = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </svg>
);

export const IconPencil = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 20h4l10.5-10.5a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z" />
  </svg>
);

export const IconTrash = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7" />
  </svg>
);

export const IconPaperclip = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l7.5-7.5a3.5 3.5 0 0 1 5 5L10 17.5a2 2 0 0 1-3-3l7-7" />
  </svg>
);

export const IconSpark = ({ size = 15 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z" />
  </svg>
);

export const IconSearch = ({ size = 15 }: IconProps) => (
  <svg {...svg(size)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const IconArrowDown = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const IconSun = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const IconMoon = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
);

export const IconFolder = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2a2 2 0 0 1 1.5.7l1.1 1.3h7.2A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5Z" />
  </svg>
);

export const IconPlug = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M9 3v5M15 3v5" />
    <path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0Z" />
    <path d="M12 17v4" />
  </svg>
);

export const IconSliders = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2.2" />
    <circle cx="8" cy="17" r="2.2" />
  </svg>
);

export const IconChevron = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="m8 10 4 4 4-4" />
  </svg>
);

export const IconX = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconArrowLeft = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconShare = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 15V4M8 7.5 12 3.5l4 4" />
    <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
  </svg>
);

export const IconMore = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <circle cx="5.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconMic = ({ size = 18 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="9" y="3" width="6" height="10" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
  </svg>
);

export const IconCamera = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.2-1.7A1.5 1.5 0 0 1 9.6 3.7h4.8a1.5 1.5 0 0 1 1.2.6L16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" />
    <circle cx="12" cy="12.5" r="3.4" />
  </svg>
);

export const IconImage = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="9.5" r="1.6" />
    <path d="m4.5 17 4.8-4.4a2 2 0 0 1 2.7 0l2 1.9 1.6-1.4a2 2 0 0 1 2.7 0l1.2 1.1" />
  </svg>
);

export const IconSparkles = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M11 3.8 12.4 8l4.2 1.4-4.2 1.5L11 15l-1.4-4.1L5.4 9.4 9.6 8Z" />
    <path d="M18 14.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
  </svg>
);

export const IconCog = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 3.2v2M12 18.8v2M4.7 7.6l1.7 1M17.6 15.4l1.7 1M4.7 16.4l1.7-1M17.6 8.6l1.7-1" />
  </svg>
);

export const IconPhone = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
    <path d="M10.5 5.2h3M11 18.4h2" />
  </svg>
);

export const IconDownload = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
    <path d="M5 19.5h14" />
  </svg>
);

export const IconUpload = ({ size = 17 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" />
    <path d="M5 19.5h14" />
  </svg>
);

export const IconFile = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
    <path d="M13.5 3v5.5H19" />
  </svg>
);

export const IconCheckCircle = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.4 12.2 2.5 2.5 4.7-5" />
  </svg>
);

export const IconPin = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M9 3h6M10 3v6l-3.5 3.2V14h11v-1.8L14 9V3" />
    <path d="M12 14v7" />
  </svg>
);

export const IconArchive = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="3" y="4" width="18" height="4" rx="1.5" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

export const IconGhost = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M5 20v-8.5a7 7 0 0 1 14 0V20l-2.3-1.7L14.4 20l-2.4-1.7L9.6 20l-2.3-1.7Z" />
    <path d="M9.5 10.5h.01M14.5 10.5h.01" strokeWidth={2.2} />
  </svg>
);

export const IconThumbUp = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 10.5h3V20H4z" />
    <path d="M7 10.5 11 3.8a1.8 1.8 0 0 1 3.1 1.6L13.3 10h4.6a2 2 0 0 1 2 2.4l-1.2 5.7a2 2 0 0 1-2 1.9H7" />
  </svg>
);

export const IconThumbDown = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 13.5h3V4H4z" />
    <path d="M7 13.5 11 20.2a1.8 1.8 0 0 0 3.1-1.6L13.3 14h4.6a2 2 0 0 0 2-2.4l-1.2-5.7a2 2 0 0 0-2-1.9H7" />
  </svg>
);

export const IconVolume = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const IconKeyboard = ({ size = 16 }: IconProps) => (
  <svg {...svg(size)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8" strokeWidth={2} />
  </svg>
);
