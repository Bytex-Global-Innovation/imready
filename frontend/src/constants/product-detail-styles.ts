/** Product detail page class tokens — keeps hex/arbitrary values out of components */
export const PRODUCT_DETAIL_CLASSES = {
  navyText: "text-[#213c73]",
  navyBorder: "border-[#213c73]",
  navyBorderMuted: "border-[#213c73]/50",
  navyBorderHover: "hover:border-[#213c73]",
  navyBgMuted: "lg:bg-[#213c73]/60",
  navyRing: "lg:ring-2 lg:ring-[#213c73]/60",
  navyFocusRing: "focus:ring-2 focus:ring-[#213c73]/30",
  overlayGradient: "bg-gradient-to-r from-[#213c73] via-blue-400 to-cyan-400",
  notifyDisabled: "cursor-not-allowed border border-[#cfcfcf] bg-[#d6d9dd] text-white",
  notifyActive: "bg-orange-400 text-white hover:bg-orange-600 active:bg-[#c0463d]",
  quantityBtn:
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-gray-400 bg-white text-xl font-bold text-foreground transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50",
  quantityValue: "w-6 text-center text-lg font-medium text-foreground",
  outOfStock: "ml-2 text-xs text-red-500",
  priceDesktop: "text-3xl font-bold tracking-tight text-gray-900",
  priceGstDesktop: "ml-1 text-base font-semibold text-gray-500",
  priceSubDesktop: "mt-1 text-xs font-medium text-gray-500",
  priceMobile: "text-[28px] font-bold tracking-tight text-gray-900",
  priceGstMobile: "ml-1 text-sm font-semibold text-gray-500",
  priceSubMobile: "mt-1 text-xs font-medium text-gray-500",
  toast: "fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg lg:bottom-6",
  desktopShell: "mx-auto hidden max-w-[1700px] bg-gray-50 px-2 md:px-0 lg:block",
  desktopCard:
    "flex flex-col gap-8 overflow-visible border border-gray-200 bg-white p-4 lg:flex-row lg:items-start",
  galleryColumn:
    "relative flex min-w-[340px] flex-col border-r border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 md:min-w-[390px] lg:min-w-[420px]",
  shareBtnDesktop:
    "cursor-pointer rounded-full bg-white p-2 backdrop-blur-md transition-all duration-200 ease-in-out hover:bg-gray-100 focus:outline-none",
  favBtnDesktop:
    "mb-1 flex cursor-pointer items-center justify-center rounded-full bg-white p-2 backdrop-blur-md transition-all hover:bg-red-100 focus:outline-none",
  favActive: "fill-red-500 text-red-500",
  favIdle: "text-gray-400",
  mainImageFrame: "relative rounded-lg border border-gray-200 bg-white/70 p-3 shadow-sm",
  infoColumn: "flex flex-1 flex-col py-8 pl-6 pr-2 lg:self-start",
  titleDesktop: "mb-2 text-2xl font-semibold capitalize text-gray-900 lg:text-3xl",
  accessoryDesc: "w-full text-sm font-semibold text-gray-700",
  specPill:
    "inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200",
  specPillIcon: "h-5 w-5 text-[#213c73]",
  quantityLabel: "mb-1 text-base font-medium text-foreground",
  serviceChevron: "h-5 w-5 text-gray-800",
  serviceScrollMobile: "mobile-services-scroll flex snap-x snap-mandatory gap-0 overflow-x-auto py-1 pl-12 pr-2",
  serviceScrollDesktop:
    "flex flex-nowrap space-x-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  serviceBtnBase:
    "flex shrink-0 cursor-pointer flex-col items-center justify-start text-center transition duration-300",
  serviceBtnMobile: "w-28 min-w-[110px] snap-start rounded-lg p-2.5",
  serviceBtnDesktop: "w-20 min-w-[80px] p-2",
  serviceIconWrapMobile: "h-7 w-7",
  serviceIconWrapDesktop: "h-10 w-10",
  serviceIconMobile: "h-3 w-3",
  serviceIconDesktop: "h-5 w-5",
  serviceLabelMobile: "min-h-0 text-[12px] leading-tight",
  serviceLabelDesktop: "min-h-[28px] text-[10px]",
  serviceLabelPartMobile: "text-[11px]",
  serviceLabelPartDesktop: "text-[10px]",
  mobileShell: "mt-4 block w-full bg-white pb-28 lg:hidden",
  mobileShareBtn:
    "cursor-pointer rounded-full bg-white p-2 shadow-sm backdrop-blur-md transition-all ease-in-out hover:bg-gray-100 focus:outline-none",
  carouselTrack:
    "scrollbar-hide h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  dotActive: "bg-gray-800",
  dotIdle: "bg-gray-300",
  carouselDot: "h-2 w-2 cursor-pointer rounded-full",
  mobileTitle: "text-[24px] font-normal leading-tight text-gray-900",
  mobileSpecs: "break-words text-[14px] font-normal leading-[20px] text-gray-800",
  mobileQuantityLabel: "text-foreground",
  mobileServicesTitle: "text-md mb-1 font-semibold text-foreground",
  stickyBar: "fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-md lg:hidden",
  overlayPanel: "relative rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5",
  overlayTitle: "text-base font-semibold text-gray-900",
  overlayClose:
    "cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#213c73]/30",
  overlayBody: "mt-3 max-h-60 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3",
  overlayText: "whitespace-pre-line text-sm leading-6 text-gray-700",
  outOfStockBanner: "mb-2 text-center text-[14px] font-semibold text-red-500",
  overlayDivider: "mt-3 h-px bg-gray-100",
  mobileFavBtn:
    "flex cursor-pointer items-center justify-center rounded-full p-2 shadow-sm backdrop-blur-md transition-all focus:outline-none",
  overlayServiceIcon: "hidden h-5 w-5 text-[#213c73] sm:inline",
  stickyBarInner: "mx-0 w-full max-w-none border-t border-gray-200 bg-white shadow-md",
} as const;

export const PRODUCT_DETAIL_SPEC_CLASSES = {
  mobileDescription: "mb-4 ml-[-17px] mr-[-17px] whitespace-pre-wrap text-[12px] text-gray-700 lg:hidden",
  tableWrap: "ml-[-17px] mr-[-17px] overflow-hidden rounded-2xl border border-gray-200 bg-white",
  th: "select-none border-b border-gray-300 py-5 px-8 text-left font-extrabold tracking-wide text-gray-800",
  emptyCell: "border-b py-7 px-6 text-center italic text-gray-400",
  groupRow: "bg-blue-100",
  groupCell: "select-none border-b border-gray-300 py-3 px-8 font-bold tracking-wider text-blue-900",
  groupSpacer: "border-b border-gray-300",
  row: "cursor-default bg-white transition-colors duration-200 hover:bg-blue-50",
  labelCell:
    "break-words whitespace-normal border-b border-gray-200 py-5 px-8 align-top font-semibold text-gray-900",
  valueCell:
    "max-w-[450px] break-words whitespace-normal border-b border-gray-200 py-5 px-8 font-normal text-gray-900",
  mobileEmpty: "text-center italic text-gray-400",
  groupTitle: "mb-1 text-md font-bold text-gray-900",
  mobileLabel: "text-xs text-gray-500",
  mobileValue: "break-words whitespace-pre-wrap text-xs font-medium text-gray-900",
  showMoreBtn: "inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus:outline-none",
  showMoreText: "font-semibold text-blue-600",
  showMoreIcon: "h-4 w-4 text-blue-600 transition-transform",
  showMoreDesktop:
    "inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-700 bg-blue-200 px-4 py-2 text-sm font-medium focus:outline-none",
} as const;

export const PRODUCT_DETAIL_SHARE_CLASSES = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
  dialog: "relative mx-4 w-full max-w-md rounded-[18px] bg-white p-8 text-foreground",
  closeBtn: "cursor-pointer font-semibold text-foreground hover:text-gray-600",
  link: "flex cursor-pointer flex-col items-center hover:underline",
  label: "pt-2 text-[13px]",
  facebook: "flex h-9 w-11 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white",
  x: "flex h-9 w-11 items-center justify-center rounded bg-black text-sm font-bold text-white",
  whatsapp: "flex h-9 w-11 items-center justify-center rounded bg-green-500 text-sm font-bold text-white",
  email: "flex h-9 w-11 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white",
  copy: "flex h-9 w-11 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-800",
} as const;

export const PRODUCT_DETAIL_IMAGE_CLASSES = {
  thumbList:
    "h-[300px] max-h-[472px] overflow-y-auto px-3 sm:h-[400px] md:h-[472px] [scrollbar-width:thin] [scrollbar-color:rgba(100,116,139,0.4)_transparent]",
  thumbBtn:
    "flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-lg border p-1 transition focus:outline-none sm:h-[60px] sm:w-[60px] md:h-[80px] md:w-[80px]",
  thumbSelected: "border-blue-600 shadow-lg",
  thumbIdle: "border-gray-300 hover:border-blue-400 hover:shadow-md",
  thumbImgBase: "h-full w-full rounded-md object-contain transition-opacity duration-300",
  thumbImgSelected: "opacity-100",
  thumbImgIdle: "opacity-60 hover:opacity-90",
  empty:
    "flex h-[250px] w-full items-center justify-center bg-gray-50 sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]",
  emptyLabel: "text-sm text-gray-400",
  viewport:
    "relative h-[250px] w-full border-gray-300 sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]",
  viewportCrosshair: "cursor-crosshair",
  viewportDefault: "cursor-default",
  productImg: "h-full w-full object-contain select-none pointer-events-auto",
  zoomPane: "z-10 hidden lg:block absolute left-[107%] top-[-40px] overflow-hidden bg-white shadow-[0_8px_24px_rgba(66,133,244,0.25)]",
} as const;

export const PRODUCT_DETAIL_RATING_CLASSES = {
  starFilled: "fill-amber-400 text-amber-400",
  starEmpty: "fill-gray-200 text-gray-200",
  count: "text-sm text-gray-600",
  size20: "h-5 w-5",
} as const;

export const PRODUCT_DETAIL_MAGNIFIER = {
  zoomBoxWidth: 735,
  zoomBoxHeight: 580,
  magnifierSize: 240,
  lensBackground: "rgba(66, 133, 244, 0.15)",
  lensShadow: "0 4px 12px rgba(66, 133, 244, 0.4)",
  previewBackground: "#fff",
  previewShadow: "0 8px 24px rgba(66,133,244,0.25)",
} as const;
