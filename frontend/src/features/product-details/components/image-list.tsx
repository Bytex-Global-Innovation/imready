import { toAbsoluteProductImageUrl } from "@/constants/product-detail";
import { cn } from "@/lib/utils";

const classes = {
  thumbList:
    "h-[300px] max-h-[472px] overflow-y-auto px-3 sm:h-[400px] md:h-[472px] [scrollbar-width:thin] [scrollbar-color:rgba(100,116,139,0.4)_transparent]",
  thumbBtn:
    "flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-lg border p-1 transition focus:outline-none sm:h-[60px] sm:w-[60px] md:h-[80px] md:w-[80px]",
  thumbSelected: "border-blue-600 shadow-lg",
  thumbIdle: "border-gray-300 hover:border-blue-400 hover:shadow-md",
  thumbImgBase: "h-full w-full rounded-md object-contain transition-opacity duration-300",
  thumbImgSelected: "opacity-100",
  thumbImgIdle: "opacity-60 hover:opacity-90",
} as const;

interface ImageListProps {
  images: string[];
  selectedImage: string | undefined;
  onSelect: (img: string, idx: number) => void;
}

export function ImageList({ images, selectedImage, onSelect }: ImageListProps) {
  return (
    <div
      className={classes.thumbList}
      tabIndex={0}
      aria-label="Product image thumbnails"
    >
      <div className="flex flex-col space-y-3">
        {images.map((img, index) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={`${img}-${index}`}
              onClick={() => onSelect(img, index)}
              type="button"
              aria-current={isSelected}
              aria-label={`Product image thumbnails ${index + 1}`}
              className={cn(
                classes.thumbBtn,
                isSelected ? classes.thumbSelected : classes.thumbIdle,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={toAbsoluteProductImageUrl(img)}
                alt={`Product thumbnail ${index + 1}`}
                className={cn(
                  classes.thumbImgBase,
                  isSelected ? classes.thumbImgSelected : classes.thumbImgIdle,
                )}
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
