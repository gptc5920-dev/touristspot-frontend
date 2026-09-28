/* oxlint-disable react/only-export-components -- This module intentionally exports components produced by one icon factory. */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft,
  faAnglesRight,
  faArrowRight,
  faArrowRotateLeft,
  faArrowUp,
  faBars,
  faBookmark,
  faBuilding,
  faCalendarDays,
  faCalendarWeek,
  faCar,
  faChartColumn,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faClipboardCheck,
  faClock,
  faComment,
  faCompass,
  faDatabase,
  faDownload,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFileLines,
  faFloppyDisk,
  faGear,
  faImage,
  faLanguage,
  faLink,
  faListCheck,
  faLocationArrow,
  faLocationCrosshairs,
  faLocationDot,
  faMagnifyingGlass,
  faMapLocationDot,
  faPaperPlane,
  faPause,
  faPenToSquare,
  faPhone,
  faPlay,
  faPlus,
  faPrint,
  faRightFromBracket,
  faRightToBracket,
  faRotate,
  faRoute,
  faShareNodes,
  faShieldHalved,
  faSliders,
  faStar,
  faTableColumns,
  faTrashCan,
  faTriangleExclamation,
  faUpload,
  faUser,
  faUserPlus,
  faUsers,
  faUtensils,
  faWallet,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

function createIcon(icon, displayName) {
  const Icon = ({ size = 24, style, ...props }) => (
    <FontAwesomeIcon
      icon={icon}
      {...props}
      style={{ width: size, height: size, ...style }}
    />
  )
  Icon.displayName = displayName
  return Icon
}

export const ArrowRight = createIcon(faArrowRight, 'ArrowRight')
export const ArrowUp = createIcon(faArrowUp, 'ArrowUp')
export const BadgeCheck = createIcon(faCircleCheck, 'BadgeCheck')
export const Bookmark = createIcon(faBookmark, 'Bookmark')
export const BarChart3 = createIcon(faChartColumn, 'BarChart3')
export const Building2 = createIcon(faBuilding, 'Building2')
export const CalendarDays = createIcon(faCalendarDays, 'CalendarDays')
export const CalendarRange = createIcon(faCalendarWeek, 'CalendarRange')
export const CarFront = createIcon(faCar, 'CarFront')
export const Check = createIcon(faCheck, 'Check')
export const ChevronDown = createIcon(faChevronDown, 'ChevronDown')
export const ChevronLeft = createIcon(faChevronLeft, 'ChevronLeft')
export const ChevronRight = createIcon(faChevronRight, 'ChevronRight')
export const CircleAlert = createIcon(faCircleExclamation, 'CircleAlert')
export const ClipboardCheck = createIcon(faClipboardCheck, 'ClipboardCheck')
export const Clock3 = createIcon(faClock, 'Clock3')
export const Compass = createIcon(faCompass, 'Compass')
export const Database = createIcon(faDatabase, 'Database')
export const Download = createIcon(faDownload, 'Download')
export const Eye = createIcon(faEye, 'Eye')
export const EyeOff = createIcon(faEyeSlash, 'EyeOff')
export const FileClock = createIcon(faFileLines, 'FileClock')
export const ImagePlus = createIcon(faImage, 'ImagePlus')
export const Info = createIcon(faCircleInfo, 'Info')
export const Languages = createIcon(faLanguage, 'Languages')
export const LayoutDashboard = createIcon(faTableColumns, 'LayoutDashboard')
export const Link2 = createIcon(faLink, 'Link2')
export const ListChecks = createIcon(faListCheck, 'ListChecks')
export const LocateFixed = createIcon(faLocationCrosshairs, 'LocateFixed')
export const LogIn = createIcon(faRightToBracket, 'LogIn')
export const LogOut = createIcon(faRightFromBracket, 'LogOut')
export const Mail = createIcon(faEnvelope, 'Mail')
export const MapPin = createIcon(faLocationDot, 'MapPin')
export const MapPinned = createIcon(faMapLocationDot, 'MapPinned')
export const Menu = createIcon(faBars, 'Menu')
export const MessageCircle = createIcon(faComment, 'MessageCircle')
export const Navigation = createIcon(faLocationArrow, 'Navigation')
export const PanelLeftClose = createIcon(faAnglesLeft, 'PanelLeftClose')
export const PanelLeftOpen = createIcon(faAnglesRight, 'PanelLeftOpen')
export const Pause = createIcon(faPause, 'Pause')
export const PencilLine = createIcon(faPenToSquare, 'PencilLine')
export const Phone = createIcon(faPhone, 'Phone')
export const Play = createIcon(faPlay, 'Play')
export const Plus = createIcon(faPlus, 'Plus')
export const Printer = createIcon(faPrint, 'Printer')
export const RefreshCw = createIcon(faRotate, 'RefreshCw')
export const RotateCcw = createIcon(faArrowRotateLeft, 'RotateCcw')
export const Route = createIcon(faRoute, 'Route')
export const Save = createIcon(faFloppyDisk, 'Save')
export const Search = createIcon(faMagnifyingGlass, 'Search')
export const Send = createIcon(faPaperPlane, 'Send')
export const Settings2 = createIcon(faGear, 'Settings2')
export const Share2 = createIcon(faShareNodes, 'Share2')
export const ShieldCheck = createIcon(faShieldHalved, 'ShieldCheck')
export const SlidersHorizontal = createIcon(faSliders, 'SlidersHorizontal')
export const Sparkles = createIcon(faWandMagicSparkles, 'Sparkles')
export const Star = createIcon(faStar, 'Star')
export const Trash2 = createIcon(faTrashCan, 'Trash2')
export const TriangleAlert = createIcon(faTriangleExclamation, 'TriangleAlert')
export const Upload = createIcon(faUpload, 'Upload')
export const UserPlus = createIcon(faUserPlus, 'UserPlus')
export const UserRound = createIcon(faUser, 'UserRound')
export const Users = createIcon(faUsers, 'Users')
export const Utensils = createIcon(faUtensils, 'Utensils')
export const WalletCards = createIcon(faWallet, 'WalletCards')
export const WandSparkles = createIcon(faWandMagicSparkles, 'WandSparkles')
export const X = createIcon(faXmark, 'X')
