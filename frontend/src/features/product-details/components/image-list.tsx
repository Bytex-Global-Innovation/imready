import { PRODUCT_DETAIL_COPY, PRODUCT_DETAIL_IMAGE_CLASSES } from "@/constants";
import { cn } from "@/lib/utils";

interface ImageListProps {
  images: string[];
  selectedImage: string | undefined;
  onSelect: (img: string, idx: number) => void;
}

export function ImageList({ images, selectedImage, onSelect }: ImageListProps) {
  return (
    <div
      className={PRODUCT_DETAIL_IMAGE_CLASSES.thumbList}
      tabIndex={0}
      aria-label={PRODUCT_DETAIL_COPY.thumbnails}
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
              aria-label={`${PRODUCT_DETAIL_COPY.thumbnails} ${index + 1}`}
              className={cn(
                PRODUCT_DETAIL_IMAGE_CLASSES.thumbBtn,
                isSelected
                  ? PRODUCT_DETAIL_IMAGE_CLASSES.thumbSelected
                  : PRODUCT_DETAIL_IMAGE_CLASSES.thumbIdle,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                className={cn(
                  PRODUCT_DETAIL_IMAGE_CLASSES.thumbImgBase,
                  isSelected
                    ? PRODUCT_DETAIL_IMAGE_CLASSES.thumbImgSelected
                    : PRODUCT_DETAIL_IMAGE_CLASSES.thumbImgIdle,
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
